// BookRift — аккаунттарға ортақ криптография (middleware.js және tools/accounts.mjs қолданады).
// Тек WebCrypto қолданылады, сондықтан Vercel Edge-те де, Node-та да бірдей жұмыс істейді.

const enc = new TextEncoder();
const dec = new TextDecoder();

export const PBKDF2_ITERATIONS = 20000;

export function b64url(bytes) {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromB64url(text) {
  const s = atob(String(text).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

export const utf8 = (text) => enc.encode(text);
export const fromUtf8 = (bytes) => dec.decode(bytes);

// Құпиясөздің хэші: PBKDF2-SHA256
export async function hashPassword(password, saltB64) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromB64url(saltB64), iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return b64url(bits);
}

async function aesKey(keyB64) {
  return crypto.subtle.importKey('raw', fromB64url(keyB64), 'AES-GCM', false, ['encrypt', 'decrypt']);
}

// Аккаунттар тізімі AES-GCM-мен шифрланып репозиторийде сақталады (репо ашық болса да оқылмайды)
export async function encryptJSON(value, keyB64) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(keyB64), enc.encode(JSON.stringify(value)));
  return b64url(iv) + '.' + b64url(data);
}

export async function decryptJSON(payload, keyB64) {
  const [iv, data] = String(payload).split('.');
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64url(iv) }, await aesKey(keyB64), fromB64url(data));
  return JSON.parse(dec.decode(plain));
}
