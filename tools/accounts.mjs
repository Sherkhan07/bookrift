// BookRift — аккаунт генераторы.
//
//   node tools/accounts.mjs
//
// Оқиды:   private/roster.txt      — сыныптар мен адамдар тізімі
// Жазады:  private/accounts.json   — логин + ашық құпиясөз (тек сіздің компьютеріңізде)
//          private/credentials.csv — оқушыларға таратуға арналған кесте (Excel ашады)
//          private/accounts.key    — шифр кілті → Vercel-де ACCOUNTS_KEY ретінде қойылады
//          accounts.enc.js         — шифрланған тізім (GitHub-қа жүктеледі, кілтсіз оқылмайды)
//
// Бар аккаунттардың құпиясөзі өзгермейді. Біреудің құпиясөзін жаңарту үшін
// private/accounts.json ішінен оның жолын өшіріп, скриптті қайта іске қосыңыз.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { b64url, hashPassword, encryptJSON } from './auth-core.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const P = (...parts) => join(ROOT, ...parts);

const STAFF_ROLES = { teacher: 'teacher', moderator: 'moderator', admin: 'admin' };
const STAFF_LOGINS = { teacher: 'teacher', moderator: 'moderator', admin: 'admin' };

const MAP = {
  а: 'a', ә: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'i',
  к: 'k', қ: 'k', л: 'l', м: 'm', н: 'n', ң: 'n', о: 'o', ө: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ұ: 'u', ү: 'u', ф: 'f', х: 'h', һ: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'y', і: 'i', ь: '',
  э: 'e', ю: 'yu', я: 'ya'
};
const translit = (word) => [...word.toLowerCase()].map((ch) => (ch in MAP ? MAP[ch] : /[a-z0-9]/.test(ch) ? ch : '')).join('');

// Балаларға оңай: 3 әріп + 3 сан, шатастыратын әріптерсіз (l, o, i)
function makePassword() {
  const letters = 'abcdefghjkmnpqrstuvwxyz';
  const rnd = crypto.getRandomValues(new Uint32Array(6));
  let out = '';
  for (let i = 0; i < 3; i++) out += letters[rnd[i] % letters.length];
  for (let i = 3; i < 6; i++) out += String(rnd[i] % 10);
  return out;
}

function parseRoster(text) {
  const people = [];
  let group = null;
  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\s+/g, ' ').trim();
    if (!line || line.startsWith('#')) continue;
    const header = /^\[(.+)\]$/.exec(line);
    if (header) {
      group = header[1].trim();
      continue;
    }
    if (!group) throw new Error(`Топсыз жол: «${line}». Алдымен [5А] сияқты тақырып жазыңыз.`);
    const role = STAFF_ROLES[group.toLowerCase()] || 'student';
    people.push({ name: line, role, class: role === 'student' ? group : null });
  }
  return people;
}

function baseLogin(person) {
  if (person.role !== 'student') return STAFF_LOGINS[person.role];
  const [surname, first] = person.name.split(' ');
  return first ? `${translit(first)}.${translit(surname)}` : translit(surname);
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

async function main() {
  const roster = parseRoster(readFileSync(P('private', 'roster.txt'), 'utf8'));
  const previous = existsSync(P('private', 'accounts.json')) ? JSON.parse(readFileSync(P('private', 'accounts.json'), 'utf8')) : [];
  const byKey = new Map(previous.map((a) => [`${a.role}|${a.class}|${a.name}`, a]));

  let keyB64;
  if (existsSync(P('private', 'accounts.key'))) keyB64 = readFileSync(P('private', 'accounts.key'), 'utf8').trim();
  else {
    keyB64 = b64url(crypto.getRandomValues(new Uint8Array(32)));
    writeFileSync(P('private', 'accounts.key'), keyB64 + '\n');
  }

  const used = new Set();
  const accounts = [];
  const created = [];
  for (const person of roster) {
    const old = byKey.get(`${person.role}|${person.class}|${person.name}`);
    let login = old && !used.has(old.login) ? old.login : null;
    if (!login) {
      const base = baseLogin(person);
      login = base;
      for (let n = 2; used.has(login) || previous.some((a) => a.login === login && a !== old); n++) login = `${base}${n}`;
    }
    used.add(login);
    const account = { login, password: old ? old.password : makePassword(), name: person.name, role: person.role, class: person.class };
    if (!old) created.push(account);
    accounts.push(account);
  }

  writeFileSync(P('private', 'accounts.json'), JSON.stringify(accounts, null, 2) + '\n');

  const ROLE_NAMES = { student: 'Оқушы', teacher: 'Пән жетекшісі', moderator: 'Модератор', admin: 'Админ' };
  const rows = [['Сынып', 'Аты-жөні', 'Рөлі', 'Логин', 'Құпиясөз'], ...accounts.map((a) => [a.class || '', a.name, ROLE_NAMES[a.role], a.login, a.password])];
  writeFileSync(P('private', 'credentials.csv'), '﻿' + rows.map((r) => r.map(csvCell).join(';')).join('\r\n') + '\r\n');

  const secure = [];
  for (const a of accounts) {
    const salt = b64url(crypto.getRandomValues(new Uint8Array(12)));
    secure.push({ l: a.login, n: a.name, r: a.role, c: a.class, s: salt, h: await hashPassword(a.password, salt) });
  }
  const payload = await encryptJSON(secure, keyB64);
  writeFileSync(
    P('accounts.enc.js'),
    `// Автоматты жасалды: node tools/accounts.mjs. Қолмен өзгертпеңіз.\n// Шифрланған аккаунттар тізімі; кілті Vercel-дегі ACCOUNTS_KEY айнымалысында.\nexport default '${payload}';\n`,
  );

  const counts = accounts.reduce((acc, a) => ((acc[a.class || a.role] = (acc[a.class || a.role] || 0) + 1), acc), {});
  console.log(`Барлығы: ${accounts.length} аккаунт`, counts);
  console.log(`Жаңа: ${created.length}`);
  console.log('Кесте: private/credentials.csv');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
