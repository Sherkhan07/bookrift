// Vercel Routing Middleware — сайттың барлық бетін логин/парольмен қорғайды.
//
// Vercel → Project → Settings → Environment Variables:
//   AUTH_USERS  = "login1:password1,login2:password2"   (міндетті)
//   AUTH_SECRET = кез келген ұзын кездейсоқ жол            (ұсынылады)
//
// Бұл файл серверде (Vercel Edge) орындалады, сондықтан пароль браузерге ешқашан жіберілмейді.

export const config = {
  // Барлық сұраныстар middleware арқылы өтеді
  matcher: '/:path*',
};

const COOKIE = 'br_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 күн
const LOGIN_PAGE = '/login.html';
const PUBLIC_PATHS = new Set([LOGIN_PAGE, '/favicon.ico']);

const enc = new TextEncoder();

function getUsers() {
  const raw = (typeof process !== 'undefined' && process.env && process.env.AUTH_USERS) || '';
  const users = new Map();
  for (const pair of raw.split(',')) {
    const i = pair.indexOf(':');
    if (i <= 0) continue;
    const login = pair.slice(0, i).trim();
    const password = pair.slice(i + 1).trim();
    if (login && password) users.set(login, password);
  }
  return users;
}

function getSecret() {
  const env = (typeof process !== 'undefined' && process.env) || {};
  // AUTH_SECRET жоқ болса, AUTH_USERS-тен құрылады (пароль ауысса — барлық сессия жабылады)
  return env.AUTH_SECRET || 'bookrift:' + (env.AUTH_USERS || '');
}

function b64url(bytes) {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(data) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

// Уақыт бойынша ақпарат бермейтін салыстыру
function safeEqual(a, b) {
  const x = enc.encode(String(a));
  const y = enc.encode(String(b));
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

async function makeToken(login) {
  const payload = b64url(enc.encode(login)) + '.' + (Math.floor(Date.now() / 1000) + MAX_AGE);
  return payload + '.' + (await hmac(payload));
}

async function verifyToken(token) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [loginB64, exp, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  if (!safeEqual(sig, await hmac(loginB64 + '.' + exp))) return false;
  // Пайдаланушы AUTH_USERS-тен өшірілсе, сессиясы да жарамсыз болады
  try {
    const login = new TextDecoder().decode(
      Uint8Array.from(atob(loginB64.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)),
    );
    return getUsers().has(login);
  } catch {
    return false;
  }
}

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

function redirect(url, location, cookie) {
  const headers = new Headers({ Location: new URL(location, url).toString(), 'Cache-Control': 'no-store' });
  if (cookie) headers.append('Set-Cookie', cookie);
  return new Response(null, { status: 303, headers });
}

function cookieHeader(value, maxAge, secure) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

// Сұранысты өзгертпей әрі қарай жіберу (@vercel/functions ішіндегі next() дәл осылай жасайды)
function next() {
  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const secure = url.protocol === 'https:';

  // Кіру формасын тексеру
  if (path === '/api/login' && request.method === 'POST') {
    const users = getUsers();
    if (users.size === 0) {
      return new Response('AUTH_USERS орнатылмаған (Vercel → Settings → Environment Variables).', {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
    let login = '';
    let password = '';
    try {
      const form = await request.formData();
      login = String(form.get('login') || '').trim();
      password = String(form.get('password') || '');
    } catch {
      /* бос форма */
    }
    const expected = users.get(login);
    if (expected !== undefined && safeEqual(password, expected)) {
      return redirect(url, '/', cookieHeader(await makeToken(login), MAX_AGE, secure));
    }
    // Парольді теріп көруді баяулату
    await new Promise((r) => setTimeout(r, 700));
    return redirect(url, LOGIN_PAGE + '?error=1');
  }

  // Шығу
  if (path === '/logout' || path === '/api/logout') {
    return redirect(url, LOGIN_PAGE, cookieHeader('', 0, secure));
  }

  const authed = await verifyToken(readCookie(request, COOKIE));

  if (PUBLIC_PATHS.has(path)) {
    // Кіріп қойған адамды бірден басты бетке жібереміз
    if (path === LOGIN_PAGE && authed) return redirect(url, '/');
    return next();
  }

  if (authed) return next();

  return redirect(url, LOGIN_PAGE);
}
