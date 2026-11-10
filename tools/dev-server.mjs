// Жергілікті тексеру сервері: Vercel сияқты алдымен middleware.js-ті іске қосады,
// содан кейін статикалық файлдарды береді.
//
//   node tools/dev-server.mjs        → http://localhost:8123
//
// ACCOUNTS_KEY берілмесе, private/accounts.key файлынан алынады.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 8123);

if (!process.env.ACCOUNTS_KEY && existsSync(join(ROOT, 'private', 'accounts.key'))) {
  process.env.ACCOUNTS_KEY = readFileSync(join(ROOT, 'private', 'accounts.key'), 'utf8').trim();
}

const { default: middleware } = await import(join(ROOT, 'middleware.js'));

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json'
};

async function serveStatic(pathname, res) {
  let file = normalize(join(ROOT, decodeURIComponent(pathname)));
  if (!file.startsWith(ROOT)) return res.writeHead(403).end();
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
}

createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const url = `http://localhost:${PORT}${req.url}`;
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
  });
  const response = await middleware(request);
  if (response.headers.get('x-middleware-next')) return serveStatic(new URL(url).pathname, res);
  const headers = {};
  response.headers.forEach((value, key) => {
    if (key !== 'set-cookie') headers[key] = value;
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length) headers['set-cookie'] = cookies;
  res.writeHead(response.status, headers).end(Buffer.from(await response.arrayBuffer()));
}).listen(PORT, () => console.log(`BookRift dev: http://localhost:${PORT}`));
