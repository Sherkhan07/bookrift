// Vercel Routing Middleware — әр оқушы мен қызметкер өз логин/құпиясөзімен кіреді.
//
// Vercel → Project → Settings → Environment Variables:
//   ACCOUNTS_KEY = private/accounts.key файлындағы жол (міндетті)
//
// Аккаунттар accounts.enc.js ішінде шифрланған; оларды `node tools/accounts.mjs` жасайды.
// Бұл файл серверде (Vercel Edge) орындалады — құпиясөздер браузерге ешқашан жіберілмейді.

import ACCOUNTS_PAYLOAD from './accounts.enc.js';
import { b64url, fromB64url, utf8, fromUtf8, hashPassword, decryptJSON } from './tools/auth-core.js';

export const config = {
  matcher: '/:path*',
};

const COOKIE = 'br_session';
const USER_COOKIE = 'br_user'; // беттің JS-і оқитын ақпарат (аты, рөлі); қауіпсіздік br_session-да
const MAX_AGE = 60 * 60 * 24 * 30; // 30 күн
const LOGIN_PAGE = '/login.html';
const PUBLIC_PATHS = new Set([LOGIN_PAGE, '/favicon.ico']);
// Бұл файлдар ешкімге берілмейді
const BLOCKED = [/^\/accounts\.enc\.js$/, /^\/middleware\.js$/, /^\/tools\//, /^\/private\//, /^\/\.vercelignore$/, /^\/\.gitignore$/];
const STAFF = new Set(['teacher', 'moderator', 'admin']);

// `process.env.ACCOUNTS_KEY` тура осылай жазылуы керек: Vercel оны build кезінде мәнмен ауыстырады.
// Edge-те `process` глобалды айнымалысы болмауы мүмкін, сондықтан `typeof process` тексерісі жарамайды.
function getKey() {
  try {
    return String(process.env.ACCOUNTS_KEY || '').trim();
  } catch {
    return '';
  }
}

// Кілт табылмаса, неге екенін түсіну үшін (мәндер емес, тек атаулар көрсетіледі)
function envDiagnostics() {
  const info = [];
  try {
    info.push(`process: ${typeof process}`);
    info.push(`VERCEL_ENV: ${process.env.VERCEL_ENV || '—'}`);
    const names = Object.keys(process.env).filter((k) => /^(ACCOUNTS|AUTH)_/.test(k));
    info.push(`env атаулары: ${names.join(', ') || '—'}`);
  } catch (error) {
    info.push(`env оқылмады: ${error && error.message}`);
  }
  return info.join('\n');
}

let accountsCache = null;
async function getAccounts() {
  const key = getKey();
  if (!key) return null;
  if (!accountsCache || accountsCache.key !== key) {
    const list = await decryptJSON(ACCOUNTS_PAYLOAD, key);
    accountsCache = { key, byLogin: new Map(list.map((a) => [a.l, a])) };
  }
  return accountsCache.byLogin;
}

async function hmac(data) {
  const key = await crypto.subtle.importKey('raw', utf8('session:' + getKey()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, utf8(data)));
}

// Уақыт бойынша ақпарат бермейтін салыстыру
function safeEqual(a, b) {
  const x = utf8(String(a));
  const y = utf8(String(b));
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

async function makeToken(login) {
  const payload = b64url(utf8(login)) + '.' + (Math.floor(Date.now() / 1000) + MAX_AGE);
  return payload + '.' + (await hmac(payload));
}

// Дұрыс токен болса — аккаунтты қайтарады
async function accountFromToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [loginB64, exp, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return null;
  if (!safeEqual(sig, await hmac(loginB64 + '.' + exp))) return null;
  try {
    const accounts = await getAccounts();
    // Аккаунт тізімнен өшірілсе, сессиясы да жарамсыз болады
    return (accounts && accounts.get(fromUtf8(fromB64url(loginB64)))) || null;
  } catch {
    return null;
  }
}

const publicInfo = (a) => ({ login: a.l, name: a.n, role: a.r, class: a.c });

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

function cookie(name, value, maxAge, secure, httpOnly = true) {
  return `${name}=${value}; Path=/;${httpOnly ? ' HttpOnly;' : ''} SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

function redirect(url, location, cookies = []) {
  const headers = new Headers({ Location: new URL(location, url).toString(), 'Cache-Control': 'no-store' });
  cookies.forEach((c) => headers.append('Set-Cookie', c));
  return new Response(null, { status: 303, headers });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function text(message, status) {
  return new Response(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

// Сұранысты өзгертпей әрі қарай жіберу (@vercel/functions ішіндегі next() дәл осылай жасайды)
function next() {
  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const secure = url.protocol === 'https:';

  if (BLOCKED.some((re) => re.test(path))) return text('Not found', 404);

  if (!getKey()) {
    return text(`ACCOUNTS_KEY орнатылмаған (Vercel → Settings → Environment Variables).\n\n${envDiagnostics()}`, 500);
  }

  // Кіру формасын тексеру
  if (path === '/api/login' && request.method === 'POST') {
    let login = '';
    let password = '';
    try {
      const form = await request.formData();
      login = String(form.get('login') || '').trim().toLowerCase();
      password = String(form.get('password') || '').trim();
    } catch {
      /* бос форма */
    }
    const accounts = await getAccounts();
    const account = accounts.get(login);
    if (account && safeEqual(await hashPassword(password, account.s), account.h)) {
      return redirect(url, '/', [
        cookie(COOKIE, await makeToken(account.l), MAX_AGE, secure),
        cookie(USER_COOKIE, encodeURIComponent(JSON.stringify(publicInfo(account))), MAX_AGE, secure, false),
      ]);
    }
    // Құпиясөзді теріп көруді баяулату
    await new Promise((r) => setTimeout(r, 700));
    return redirect(url, LOGIN_PAGE + '?error=1');
  }

  // Шығу
  if (path === '/logout' || path === '/api/logout') {
    return redirect(url, LOGIN_PAGE, [cookie(COOKIE, '', 0, secure), cookie(USER_COOKIE, '', 0, secure, false)]);
  }

  const account = await accountFromToken(readCookie(request, COOKIE));

  if (PUBLIC_PATHS.has(path)) {
    // Кіріп қойған адамды бірден басты бетке жібереміз
    if (path === LOGIN_PAGE && account) return redirect(url, '/');
    return next();
  }

  if (path === '/api/me') {
    return account ? json(publicInfo(account)) : json({ error: 'unauthorized' }, 401);
  }

  // Қызметкерлерге: аккаунттар тізімі (құпиясөзсіз)
  if (path === '/api/accounts') {
    if (!account) return json({ error: 'unauthorized' }, 401);
    if (!STAFF.has(account.r)) return json({ error: 'forbidden' }, 403);
    const accounts = await getAccounts();
    const list = [...accounts.values()].filter((a) => account.r === 'admin' || a.r === 'student').map(publicInfo);
    return json(list);
  }

  if (account) return next();

  if (path.startsWith('/api/')) return json({ error: 'unauthorized' }, 401);
  return redirect(url, LOGIN_PAGE);
}
