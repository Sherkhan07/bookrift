// BookRift — рөлдер: админ, модератор, оқушы, пән жетекшісі.
// Рөл аккаунттан алынады (middleware.js br_user cookie-ін қояды).
// Сервер жоқ жерде (мысалы, python http.server) рөлді қолмен таңдауға болады — тек тексеру үшін.
// Пікірлер мен тапсырмалар әзірге осы браузердің localStorage-інде сақталады.
(() => {
  'use strict';

  const KEYS = {
    role: 'bookrift-role',
    feedback: 'bookrift-feedback',
    tasks: 'bookrift-assignments'
  };

  const ROLES = {
    admin: { icon: '🛡️', name: 'Админ', desc: 'Барлық аккаунттарды көреді.' },
    moderator: { icon: '🧹', name: 'Модератор', desc: 'Оқушылардың пікірлерін тексеріп, жариялайды.' },
    student: { icon: '🎒', name: 'Оқушы', desc: 'Кітап оқиды, деңгейден өтеді, ұпай жинайды.' },
    teacher: { icon: '🎓', name: 'Пән жетекшісі', desc: 'Сынып тізімін көріп, тапсырма береді.' }
  };
  const ROLE_ORDER = ['student', 'teacher', 'moderator', 'admin'];

  const ACCOUNT = (() => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)br_user=([^;]*)/);
      const data = match ? JSON.parse(decodeURIComponent(match[1])) : null;
      return data && ROLES[data.role] ? data : null;
    } catch (error) {
      return null;
    }
  })();

  /* ---------- сақтау ---------- */

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (error) {
      /* сақтау мүмкін болмаса, бет жұмысын жалғастырады */
    }
  }

  function getRole() {
    if (ACCOUNT) return ACCOUNT.role;
    try {
      const role = localStorage.getItem(KEYS.role);
      return ROLES[role] ? role : null;
    } catch (error) {
      return null;
    }
  }

  const getFeedback = () => read(KEYS.feedback, []);
  const getTasks = () => read(KEYS.tasks, []);

  // Аккаунттар тізімі серверден (тек қызметкерлерге)
  let accountsPromise = null;
  function loadAccounts() {
    if (!accountsPromise) {
      accountsPromise = fetch('/api/accounts', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        .then((r) => (r.ok ? r.json() : null))
        .then((list) => (Array.isArray(list) ? list : null))
        .catch(() => null);
    }
    return accountsPromise;
  }

  /* ---------- көмекші ---------- */

  const $ = (selector, root = document) => root.querySelector(selector);

  function h(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === 'text') node.textContent = value;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? '' : value);
    });
    children.flat().forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });
    return node;
  }

  const fmtDate = (iso) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('kk-KZ', { day: 'numeric', month: 'short' });
  };

  const classesOf = (list) => [...new Set(list.filter((a) => a.class).map((a) => a.class))].sort();

  function heading(eyebrow, title, sub) {
    return h('div', { class: 'section-heading role-heading' },
      h('p', { class: 'eyebrow', text: eyebrow }),
      h('h2', { text: title }),
      sub ? h('p', { class: 'muted-text', text: sub }) : null
    );
  }

  function statCard(icon, value, label) {
    return h('div', { class: 'role-stat glass-card' },
      h('span', { class: 'role-stat-icon', text: icon }),
      h('strong', { text: String(value) }),
      h('span', { text: label })
    );
  }

  const card = (title, ...children) =>
    h('div', { class: 'role-card glass-card' }, h('h3', { text: title }), ...children);

  const table = (headers, rows) =>
    h('div', { class: 'leaderboard-wrap' },
      h('table', { class: 'leaderboard-table role-table' },
        h('thead', {}, h('tr', {}, headers.map((t) => h('th', { text: t })))),
        h('tbody', {}, rows)
      )
    );

  const offlineNote = () =>
    h('p', { class: 'muted-text', text: 'Аккаунттар тізімі сайт серверде (Vercel немесе `node tools/dev-server.mjs`) іске қосылғанда көрінеді.' });

  // Сынып бойынша сүзгі батырмалары
  function classFilter(classes, active, onPick) {
    return h('div', { class: 'role-tabs' }, ['all', ...classes].map((c) =>
      h('button', { class: `small-action${c === active ? ' primary' : ''}`, type: 'button', text: c === 'all' ? 'Барлығы' : c, onclick: () => onPick(c) })
    ));
  }

  /* ---------- рөл таңдау (тек серверсіз тексеру режимінде) ---------- */

  function openPicker() {
    const picker = $('#role-picker');
    const host = $('#role-options');
    const current = getRole();
    host.innerHTML = '';
    ROLE_ORDER.forEach((id) => {
      const role = ROLES[id];
      host.append(
        h('button', { class: `role-option${id === current ? ' active' : ''}`, type: 'button', onclick: () => setRole(id) },
          h('span', { class: 'role-option-icon', text: role.icon }),
          h('strong', { text: role.name }),
          h('span', { text: role.desc })
        )
      );
    });
    const close = $('.role-picker-close', picker);
    if (close) close.remove();
    if (current) {
      $('.role-picker-card', picker).prepend(
        h('button', { class: 'dialog-close role-picker-close', type: 'button', 'aria-label': 'Жабу', onclick: closePicker, text: '✕' })
      );
    }
    picker.hidden = false;
    document.body.classList.add('role-picking');
  }

  function closePicker() {
    if (!getRole()) return;
    $('#role-picker').hidden = true;
    document.body.classList.remove('role-picking');
  }

  function setRole(id) {
    write(KEYS.role, id);
    closePicker();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- админ ---------- */

  let adminFilter = 'all';

  async function renderAdmin(host) {
    host.append(heading('Админ панелі', 'Аккаунттар', 'Жаңа оқушы қосу немесе құпиясөзді жаңарту: private/roster.txt файлын өзгертіп, `node tools/accounts.mjs` іске қосыңыз.'));
    const list = await loadAccounts();
    if (!list) return host.append(offlineNote());

    const stats = h('div', { class: 'role-stats' });
    ROLE_ORDER.forEach((id) => stats.append(statCard(ROLES[id].icon, list.filter((u) => u.role === id).length, ROLES[id].name)));
    host.append(stats);

    const groups = [...classesOf(list), 'staff'];
    const shown = list.filter((a) => adminFilter === 'all' || (adminFilter === 'staff' ? a.role !== 'student' : a.class === adminFilter));
    const tabs = classFilter(groups, adminFilter, (c) => { adminFilter = c; render(); });
    const staffTab = tabs.lastChild;
    staffTab.textContent = 'Қызметкерлер';

    host.append(card(`Барлық аккаунттар · ${shown.length}`, tabs,
      table(['Аты-жөні', 'Сынып', 'Рөлі', 'Логин'], shown.map((a) =>
        h('tr', { class: ACCOUNT && a.login === ACCOUNT.login ? 'me' : '' },
          h('td', { text: a.name }),
          h('td', { text: a.class || '—' }),
          h('td', {}, h('span', { class: `badge-pill ${a.role === 'student' ? 'green' : a.role === 'admin' ? 'gold' : 'blue'}`, text: ROLES[a.role].name })),
          h('td', {}, h('code', { text: a.login }))
        )
      ))
    ));
  }

  /* ---------- модератор ---------- */

  function renderModerator(host) {
    const items = getFeedback();
    const saveItems = (list) => { write(KEYS.feedback, list); render(); };
    const setStatus = (id, status) => saveItems(items.map((item) => (item.id === id ? { ...item, status } : item)));
    const pending = items.filter((i) => i.status === 'pending');
    const approved = items.filter((i) => i.status === 'approved');
    const rejected = items.filter((i) => i.status === 'rejected');

    host.append(heading('Модератор панелі', 'Пікірлерді тексеру', 'Оқушылар «Командалық ойын» бөлімінде жазған пікірлер осында түседі.'));
    host.append(h('div', { class: 'role-stats' },
      statCard('⏳', pending.length, 'Күтуде'),
      statCard('✅', approved.length, 'Жарияланды'),
      statCard('🚫', rejected.length, 'Қабылданбады')
    ));

    const list = (rows, actions) => {
      if (!rows.length) return h('p', { class: 'muted-text', text: 'Әзірге бос.' });
      return h('ul', { class: 'role-list' }, rows.slice().reverse().map((item) =>
        h('li', {},
          h('div', {}, h('strong', { text: `«${item.text}»` }), h('small', { text: `${item.name || (ROLES[item.author] ? ROLES[item.author].name : 'Оқушы')} · ${fmtDate(item.at)}` })),
          h('div', { class: 'row-actions' }, actions(item))
        )
      ));
    };

    host.append(
      card('Тексеруді күтіп тұр', list(pending, (item) => [
        h('button', { class: 'small-action', type: 'button', text: 'Жариялау', onclick: () => setStatus(item.id, 'approved') }),
        h('button', { class: 'small-action danger', type: 'button', text: 'Қабылдамау', onclick: () => setStatus(item.id, 'rejected') })
      ])),
      card('Жарияланған', list(approved, (item) => [
        h('button', { class: 'small-action danger', type: 'button', text: 'Жасыру', onclick: () => setStatus(item.id, 'rejected') })
      ])),
      card('Қабылданбаған', list(rejected, (item) => [
        h('button', { class: 'small-action', type: 'button', text: 'Қайтару', onclick: () => setStatus(item.id, 'pending') }),
        h('button', { class: 'small-action danger', type: 'button', text: 'Өшіру', onclick: () => saveItems(items.filter((i) => i.id !== item.id)) })
      ]))
    );
  }

  /* ---------- пән жетекшісі ---------- */

  let teacherFilter = 'all';

  async function renderTeacher(host) {
    host.append(heading('Пән жетекшісі панелі', 'Сыныптар', 'Оқушылар тізімі, логиндері және тапсырмалар.'));
    const list = await loadAccounts();
    const students = (list || []).filter((a) => a.role === 'student');
    const classes = classesOf(students);
    const tasks = getTasks();
    const saveTasks = (next) => { write(KEYS.tasks, next); render(); };

    const stats = h('div', { class: 'role-stats' }, statCard('🎒', students.length, 'Оқушы'));
    classes.forEach((c) => stats.append(statCard('🏫', students.filter((s) => s.class === c).length, `${c} сынып`)));
    stats.append(statCard('📝', tasks.length, 'Тапсырма'));
    host.append(stats);

    if (!list) host.append(card('Оқушылар', offlineNote()));
    else {
      const shown = students.filter((s) => teacherFilter === 'all' || s.class === teacherFilter);
      host.append(card(`Оқушылар · ${shown.length}`,
        classFilter(classes, teacherFilter, (c) => { teacherFilter = c; render(); }),
        table(['№', 'Аты-жөні', 'Сынып', 'Логин'], shown.map((s, i) =>
          h('tr', {}, h('td', { text: String(i + 1) }), h('td', { text: s.name }), h('td', { text: s.class }), h('td', {}, h('code', { text: s.login })))
        )),
        h('p', { class: 'muted-text role-note', text: 'Құпиясөздер сайтта көрсетілмейді — олар әкімшідегі private/credentials.csv кестесінде.' })
      ));
    }

    const titleInput = h('input', { type: 'text', placeholder: 'Мысалы: 5-тарауды оқып, 3-деңгейден өту', maxlength: '120', required: true });
    const classSelect = h('select', { 'aria-label': 'Қай сыныпқа' },
      h('option', { value: '', text: 'Барлық сынып' }), classes.map((c) => h('option', { value: c, text: c })));
    const dueInput = h('input', { type: 'date', 'aria-label': 'Мерзімі' });
    const form = h('form', { class: 'role-form', onsubmit: (event) => {
      event.preventDefault();
      const title = titleInput.value.trim();
      if (!title) return;
      saveTasks([...tasks, { id: Date.now(), title, class: classSelect.value || null, due: dueInput.value || null }]);
    } }, titleInput, classSelect, dueInput, h('button', { class: 'button button-primary', type: 'submit', text: 'Тапсырма беру' }));

    const taskList = tasks.length
      ? h('ul', { class: 'role-list' }, tasks.map((t) => h('li', {},
          h('div', {}, h('strong', { text: t.title }), h('small', { text: [t.class || 'Барлық сынып', t.due ? `мерзімі: ${fmtDate(t.due)}` : ''].filter(Boolean).join(' · ') })),
          h('div', { class: 'row-actions' }, h('button', { class: 'small-action danger', type: 'button', text: 'Өшіру', onclick: () => saveTasks(tasks.filter((x) => x.id !== t.id)) }))
        )))
      : h('p', { class: 'muted-text', text: 'Тапсырма әлі берілмеген.' });

    host.append(card('Жаңа тапсырма', form, taskList));
  }

  /* ---------- оқушы ---------- */

  function renderStudent(host) {
    const myClass = ACCOUNT && ACCOUNT.class;
    const tasks = getTasks().filter((t) => !t.class || !myClass || t.class === myClass);
    if (!tasks.length) return false;
    host.append(card('📝 Пән жетекшісінің тапсырмалары',
      h('ul', { class: 'role-list' }, tasks.map((t) => h('li', {},
        h('div', {}, h('strong', { text: t.title }), t.due ? h('small', { text: `Мерзімі: ${fmtDate(t.due)}` }) : null)
      )))
    ));
    return true;
  }

  /* ---------- жалпы рендер ---------- */

  let renderId = 0;

  async function render() {
    const id = ++renderId;
    const role = getRole();
    ROLE_ORDER.forEach((r) => document.body.classList.toggle(`role-${r}`, r === role));

    const chip = $('#role-chip');
    const parts = ACCOUNT ? ACCOUNT.name.split(' ') : [];
    const label = ACCOUNT && role === 'student' ? parts[1] || parts[0] : role ? ROLES[role].name : 'Рөл';
    $('#role-chip-name').textContent = label;
    chip.firstChild.textContent = `${role ? ROLES[role].icon : '👤'} `;
    chip.title = ACCOUNT ? `${ACCOUNT.name} · ${ROLES[role].name}${ACCOUNT.class ? ` · ${ACCOUNT.class}` : ''} — шығу` : 'Рөлді ауыстыру';
    chip.setAttribute('aria-label', ACCOUNT ? `${label}, ${ROLES[role].name}. Шығу` : `Рөл: ${role ? ROLES[role].name : 'таңдалмаған'} — ауыстыру`);

    const panel = $('#role-panel');
    const host = h('div');
    let visible = true;
    if (role === 'admin') await renderAdmin(host);
    else if (role === 'moderator') renderModerator(host);
    else if (role === 'teacher') await renderTeacher(host);
    else if (role === 'student') visible = renderStudent(host);
    else visible = false;
    if (id !== renderId) return; // жаңарақ рендер басталып кетті
    $('#role-panel-body').replaceChildren(...host.childNodes);
    panel.hidden = !visible;
    panel.classList.toggle('compact', role === 'student');
  }

  $('#role-chip').addEventListener('click', () => {
    if (!ACCOUNT) return openPicker();
    if (window.confirm(`${ACCOUNT.name}, жүйеден шығасыз ба?`)) window.location.href = '/logout';
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !$('#role-picker').hidden) closePicker();
  });
  document.addEventListener('bookrift:feedback', render);
  window.addEventListener('storage', render);

  render();
  if (!getRole()) openPicker();
})();
