/* Tablero de proyectos — bilingüe ES/EN, todo el contenido vive en data/projects.json.
   Project dashboard — bilingual ES/EN, all content lives in data/projects.json. */

const $ = (sel) => document.querySelector(sel);

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

/* Campos bilingües: {es, en}. Un string suelto se usa tal cual. */
const t = (field, lang) => {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  return field[lang] ?? field.es ?? field.en ?? '';
};

const ALL = '__all__';

const state = { data: null, lang: 'es', filter: ALL, query: '' };

/* ---------- preferencias guardadas ---------- */

const store = {
  get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* no persiste */ } }
};

const savedTheme = store.get('tablero-tema');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;

const savedLang = store.get('tablero-idioma');
if (savedLang === 'es' || savedLang === 'en') state.lang = savedLang;

$('#theme').addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  store.set('tablero-tema', root.dataset.theme);
});

$('#lang').addEventListener('click', () => {
  state.lang = state.lang === 'es' ? 'en' : 'es';
  store.set('tablero-idioma', state.lang);
  renderAll();
});

/* ---------- atajos a las cadenas de interfaz ---------- */

const L = (key) => t(state.data.ui.labels[key], state.lang);
const statusLabel = (key) => t(state.data.ui.status[key], state.lang) || key;

/* ---------- bloques de la tarjeta ---------- */

function section(label, bodyHtml, extraClass = '') {
  if (!bodyHtml) return '';
  return `<section class="block ${extraClass}">
    <h3>${esc(label)}</h3>
    ${bodyHtml}
  </section>`;
}

function timelineBlock(p) {
  const tl = p.timeline || {};
  const note = t(tl.note, state.lang);
  if (!tl.start && !tl.target && !note) return '';

  const chips = [];
  if (tl.start) chips.push(`<span class="meta-chip">${esc(L('start'))} ${esc(tl.start)}</span>`);
  chips.push(`<span class="meta-chip">${esc(L('target'))} ${esc(tl.target || L('tbd'))}</span>`);
  if (p.activity30d) {
    chips.push(`<span class="meta-chip">${esc(p.activity30d)} ${esc(L('activity'))}</span>`);
  }

  return section(L('timeline'),
    `<div class="chips">${chips.join('')}</div>` + (note ? `<p>${esc(note)}</p>` : ''));
}

function resourcesBlock(p) {
  const items = (p.resources || []).map((r) => t(r, state.lang)).filter(Boolean);
  if (!items.length) return '';
  return section(L('resources'),
    `<ul class="bullets">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`);
}

function stepsBlock(p) {
  const steps = p.steps || [];
  if (!steps.length) return '';

  const done = steps.filter((s) => s.done).length;
  const items = steps.map((s) => {
    const detail = t(s.detail, state.lang);
    return `<li class="${s.done ? 'done' : 'todo'}">
      <span class="mark" aria-hidden="true">${s.done ? '✓' : '○'}</span>
      <span class="step-body">
        <span class="step-label">${esc(t(s.label, state.lang))}</span>
        ${detail ? `<span class="step-detail">${esc(detail)}</span>` : ''}
      </span>
    </li>`;
  }).join('');

  return `<section class="block">
    <h3>${esc(L('steps'))} <span class="count">${done}/${steps.length}</span></h3>
    <ul class="steps">${items}</ul>
  </section>`;
}

function card(p) {
  const lang = state.lang;

  const tags = (p.tags || [])
    .map((tag) => `<span class="tag">${esc(tag)}</span>`).join('');

  const expected = t(p.expected, lang);
  const next = t(p.next, lang);
  const blockers = t(p.blockers, lang);

  const repo = p.repo
    ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">${esc(L('repo'))} ↗</a>`
    : `<span>${esc(L('norepo'))}</span>`;

  const last = p.lastCommit
    ? `${esc(L('lastCommit'))} ${esc(p.lastCommit)}${p.commits ? ` · ${esc(p.commits)} commits` : ''}`
    : esc(L('novcs'));

  const role = t(p.role, lang);

  return `
  <article class="card s-${esc(p.status)}">
    <div class="card-top">
      <span class="area">${esc(t(p.area, lang))}</span>
      <span class="badge ${esc(p.status)}">${esc(statusLabel(p.status))}</span>
    </div>

    <h2>${esc(t(p.name, lang))}</h2>
    <p class="short">${esc(p.short)}${role ? ` · ${esc(role)}` : ''}</p>
    <p class="summary">${esc(t(p.summary, lang))}</p>

    <div class="prog-head"><span>${esc(L('progress'))}</span><b>${esc(p.progress)}%</b></div>
    <div class="track" role="progressbar" aria-valuenow="${esc(p.progress)}"
         aria-valuemin="0" aria-valuemax="100">
      <div class="fill" style="width:${Number(p.progress) || 0}%"></div>
    </div>

    ${section(L('objective'), `<p>${esc(t(p.objective, lang))}</p>`)}
    ${timelineBlock(p)}
    ${resourcesBlock(p)}
    ${stepsBlock(p)}
    ${section(L('expected'), `<p>${esc(expected)}</p>`, 'expected')}

    ${next ? `<p class="note"><b>${esc(L('next'))}</b>${esc(next)}</p>` : ''}
    ${blockers ? `<p class="note blocker"><b>${esc(L('blocker'))}</b>${esc(blockers)}</p>` : ''}

    <div class="tags">${tags}</div>

    <div class="card-foot">
      <span>${last}</span>
      ${repo}
    </div>
  </article>`;
}

/* ---------- cabecera, filtros, rejilla ---------- */

function renderStats() {
  const projects = state.data.projects;
  const s = state.data.ui.stats;
  const n = projects.length;
  const moving = projects.filter((p) => ['active', 'in-progress'].includes(p.status)).length;
  const avg = n ? Math.round(projects.reduce((a, p) => a + (p.progress || 0), 0) / n) : 0;
  const steps = projects.flatMap((p) => p.steps || []);
  const done = steps.filter((x) => x.done).length;

  const cells = [
    [t(s.projects, state.lang), n],
    [t(s.moving, state.lang), moving],
    [t(s.avg, state.lang), avg + '%'],
    [t(s.steps, state.lang), `${done}/${steps.length}`]
  ];

  $('#stats').innerHTML = cells
    .map(([k, v]) => `<div class="stat"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join('');
}

function renderFilters() {
  const keys = [ALL, ...new Set(state.data.projects.map((p) => p.status))];
  $('#filters').innerHTML = keys.map((k) => {
    const label = k === ALL ? L('all') : statusLabel(k);
    return `<button class="chip" type="button" data-filter="${esc(k)}"
             aria-pressed="${k === state.filter}">${esc(label)}</button>`;
  }).join('');

  $('#filters').querySelectorAll('.chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.filter = btn.dataset.filter;
      renderFilters();
      renderGrid();
    });
  });
}

function renderGrid() {
  const lang = state.lang;
  const q = state.query.trim().toLowerCase();

  const list = state.data.projects.filter((p) => {
    if (state.filter !== ALL && p.status !== state.filter) return false;
    if (!q) return true;
    const hay = [
      p.short, t(p.name, lang), t(p.area, lang), t(p.summary, lang),
      t(p.objective, lang), t(p.expected, lang), ...(p.tags || [])
    ].join(' ').toLowerCase();
    return hay.includes(q);
  });

  $('#grid').innerHTML = list.map(card).join('');
  $('#empty').textContent = L('empty');
  $('#empty').hidden = list.length > 0;
}

function renderAll() {
  const { meta } = state.data;
  const lang = state.lang;

  document.documentElement.lang = lang;
  $('#lang-label').textContent = lang === 'es' ? 'EN' : 'ES';
  $('#lang').title = L('lang');
  $('#lang').setAttribute('aria-label', L('lang'));
  $('#theme').title = L('theme');
  $('#theme').setAttribute('aria-label', L('theme'));

  $('#owner').textContent = meta.owner;
  $('#subtitle').textContent = t(meta.subtitle, lang);
  $('#updated-label').textContent = L('updated');
  $('#updated').textContent = meta.updated || '—';
  $('#data-note').textContent = L('dataNote');
  $('#search').placeholder = L('search');
  $('#filters').setAttribute('aria-label', L('all'));

  document.title = `${meta.owner} — ${t(meta.subtitle, lang)}`;

  renderStats();
  renderFilters();
  renderGrid();
}

/* ---------- arranque ---------- */

fetch('data/projects.json', { cache: 'no-store' })
  .then((r) => {
    if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
    return r.json();
  })
  .then((data) => {
    const rank = (s) => ({ 'active': 0, 'in-progress': 1, 'blocked': 2, 'intermittent': 3, 'paused': 4 }[s] ?? 9);
    data.projects.sort((a, b) => rank(a.status) - rank(b.status) || b.progress - a.progress);
    state.data = data;
    renderAll();
  })
  .catch((err) => {
    $('#grid').innerHTML = `<article class="card"><h2>data/projects.json</h2>
      <p class="summary">${esc(err.message)} — si abriste el archivo con doble clic, el navegador
      bloquea la lectura local: levanta un servidor con <code>python3 -m http.server</code>
      en esta carpeta. / If you opened the file by double-clicking, the browser blocks local
      reads: serve the folder with <code>python3 -m http.server</code>.</p></article>`;
  });

$('#search').addEventListener('input', (e) => {
  state.query = e.target.value;
  if (state.data) renderGrid();
});
