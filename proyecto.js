/* Página de desglose de un proyecto — bilingüe ES/EN.
   La cabecera se arma con data/projects.json (la misma fuente del tablero) y el
   contenido largo con data/details/<id>.json, para que no haya dos verdades.

   Project breakdown page — bilingual ES/EN. The header is built from
   data/projects.json (the dashboard's own source) and the long-form content from
   data/details/<id>.json, so nothing is duplicated. */

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

const state = { lang: 'es', project: null, detail: null, ui: null };

const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* no persiste */ } }
};

const savedTheme = store.get('tablero-tema');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
const savedLang = store.get('tablero-idioma');
if (savedLang === 'es' || savedLang === 'en') state.lang = savedLang;

/* ---------- cadenas propias de esta página ---------- */

const T = {
  back:      { es: '← Tablero de proyectos', en: '← Project dashboard' },
  toc:       { es: 'En esta página', en: 'On this page' },
  progress:  { es: 'avance', en: 'progress' },
  start:     { es: 'inicio', en: 'start' },
  target:    { es: 'meta', en: 'target' },
  tbd:       { es: 'por definir', en: 'to be defined' },
  commits:   { es: 'commits', en: 'commits' },
  lastCommit:{ es: 'último commit', en: 'last commit' },
  repo:      { es: 'repositorio', en: 'repository' },
  local:     { es: 'carpeta local', en: 'local folder' },
  role:      { es: 'rol', en: 'role' },
  theme:     { es: 'Claro / oscuro', en: 'Light / dark' },
  lang:      { es: 'Español / English', en: 'Spanish / English' },
  notFound: {
    es: 'No hay desglose para este proyecto todavía. Vuelve al tablero y elige otro.',
    en: 'There is no breakdown for this project yet. Go back to the dashboard and pick another one.'
  },
  localNote: {
    es: 'Si abriste el archivo con doble clic, el navegador bloquea la lectura local: levanta un servidor con <code>python3 -m http.server</code> en esta carpeta.',
    en: 'If you opened the file by double-clicking, the browser blocks local reads: serve the folder with <code>python3 -m http.server</code>.'
  },
  foot: {
    es: 'Este desglose se escribe en <code>data/details/&lt;id&gt;.json</code>; el estado, el avance y las fechas vienen de <code>data/projects.json</code>.',
    en: 'This breakdown lives in <code>data/details/&lt;id&gt;.json</code>; status, progress and dates come from <code>data/projects.json</code>.'
  },
  refWhat:   { es: 'Qué establece', en: 'What it establishes' },
  refUse:    { es: 'Para qué se usa aquí', en: 'How it is used here' },
  noLink:    { es: 'sin enlace público', en: 'no public link' },
  done:      { es: 'hecho', en: 'done' },
  todo:      { es: 'pendiente', en: 'pending' }
};

const L = (key) => t(T[key], state.lang);

/* ---------- formato en línea mínimo: `código`, **negrita**, [texto](url) ----------
   Se aplica DESPUÉS de escapar, así que nada del JSON puede inyectar HTML. */

function md(field) {
  let s = esc(t(field, state.lang));
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return s;
}

/* ---------- tipos de bloque ---------- */

const blocks = {
  prose(b) {
    const items = Array.isArray(b.text) ? b.text : [b.text];
    return items.map((p) => `<p>${md(p)}</p>`).join('');
  },

  list(b) {
    const tag = b.ordered ? 'ol' : 'ul';
    const items = (b.items || []).map((i) => `<li>${md(i)}</li>`).join('');
    return `<${tag} class="prose-list">${items}</${tag}>`;
  },

  defs(b) {
    const items = (b.items || []).map((d) => `
      <div class="def">
        <dt>${md(d.term)}</dt>
        <dd>${md(d.def)}</dd>
      </div>`).join('');
    return `<dl class="defs">${items}</dl>`;
  },

  kv(b) {
    const items = (b.items || []).map((r) => `
      <div class="kv-row">
        <dt>${md(r.k)}</dt>
        <dd>${md(r.v)}</dd>
      </div>`).join('');
    return `<dl class="kv">${items}</dl>`;
  },

  table(b) {
    const head = (b.head || []).map((h) => `<th>${md(h)}</th>`).join('');
    const rows = (b.rows || []).map((row) =>
      `<tr>${row.map((c, i) => `<td${i === 0 ? ' class="first"' : ''}>${md(c)}</td>`).join('')}</tr>`
    ).join('');
    return `<div class="table-wrap"><table class="data">
      ${head ? `<thead><tr>${head}</tr></thead>` : ''}
      <tbody>${rows}</tbody>
    </table></div>` + (b.note ? `<p class="table-note">${md(b.note)}</p>` : '');
  },

  steps(b) {
    const items = (b.items || []).map((s, i) => `
      <li class="${s.done ? 'done' : 'todo'}">
        <span class="n" aria-hidden="true">${s.done ? '✓' : i + 1}</span>
        <div>
          <p class="st-label">${md(s.label)}</p>
          ${s.detail ? `<p class="st-detail">${md(s.detail)}</p>` : ''}
        </div>
      </li>`).join('');
    return `<ol class="big-steps">${items}</ol>`;
  },

  timeline(b) {
    const items = (b.items || []).map((e) => `
      <li class="tl-item ${esc(e.state || '')}">
        <div class="tl-head">
          ${e.tag ? `<span class="ver">${md(e.tag)}</span>` : ''}
          ${e.when ? `<span class="when">${esc(e.when)}</span>` : ''}
        </div>
        <p class="tl-title">${md(e.title)}</p>
        ${e.body ? `<p class="tl-body">${md(e.body)}</p>` : ''}
      </li>`).join('');
    return `<ol class="tl">${items}</ol>`;
  },

  callout(b) {
    /* El prefijo v- evita chocar con la clase .note del tablero, que trae sus propios estilos. */
    const variant = 'v-' + (['note', 'warn', 'ok'].includes(b.variant) ? b.variant : 'note');
    const items = Array.isArray(b.text) ? b.text : [b.text];
    return `<aside class="callout ${variant}">
      ${b.title ? `<p class="co-title">${md(b.title)}</p>` : ''}
      ${items.filter(Boolean).map((p) => `<p>${md(p)}</p>`).join('')}
      ${b.items ? `<ul>${b.items.map((i) => `<li>${md(i)}</li>`).join('')}</ul>` : ''}
    </aside>`;
  },

  code(b) {
    return `<pre class="code"><code>${esc(t(b.text, state.lang))}</code></pre>`
      + (b.note ? `<p class="table-note">${md(b.note)}</p>` : '');
  },

  refs(b) {
    const items = (b.items || []).map((r) => {
      const links = (r.links || []).map((l) =>
        `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(t(l.label, state.lang))} ↗</a>`
      ).join('');
      return `<li class="ref">
        <p class="ref-cite">${md(r.cite)}${r.venue ? ` <span class="ref-venue">${md(r.venue)}</span>` : ''}</p>
        ${r.what ? `<p class="ref-line"><b>${esc(L('refWhat'))}</b> ${md(r.what)}</p>` : ''}
        ${r.use ? `<p class="ref-line"><b>${esc(L('refUse'))}</b> ${md(r.use)}</p>` : ''}
        <p class="ref-links">${links || `<span class="faint">${esc(L('noLink'))}</span>`}</p>
      </li>`;
    }).join('');
    return `<ol class="refs">${items}</ol>`;
  }
};

function renderBlock(b) {
  const fn = blocks[b.type];
  if (!fn) return '';
  return `<div class="blk blk-${esc(b.type)}">${fn(b)}</div>`;
}

/* ---------- secciones ---------- */

function renderSections() {
  const secs = state.detail.sections || [];

  $('#sections').innerHTML = secs.map((s, i) => `
    <section class="sheet" id="s-${esc(s.id || i)}">
      <h2>${md(s.title)}</h2>
      ${s.blurb ? `<p class="sheet-blurb">${md(s.blurb)}</p>` : ''}
      ${(s.blocks || []).map(renderBlock).join('')}
    </section>`).join('');

  $('#toc-title').textContent = L('toc');
  $('#toc-list').innerHTML = secs.map((s, i) =>
    `<li><a href="#s-${esc(s.id || i)}">${md(s.title)}</a></li>`).join('');
}

/* ---------- cabecera ---------- */

function renderHead() {
  const p = state.project;
  const lang = state.lang;
  const st = state.ui.status;

  document.documentElement.lang = lang;
  $('#lang-label').textContent = lang === 'es' ? 'EN' : 'ES';
  $('#lang').title = L('lang');
  $('#lang').setAttribute('aria-label', L('lang'));
  $('#theme').title = L('theme');
  $('#theme').setAttribute('aria-label', L('theme'));
  $('#back').textContent = L('back');

  $('#area').textContent = t(p.area, lang);
  $('#title').textContent = t(p.name, lang);
  $('#short').textContent = p.short;
  $('#lede').innerHTML = md(state.detail.lede || p.summary);

  document.title = `${t(p.name, lang)} — ${p.short}`;

  $('#prog-label').textContent = L('progress');
  $('#prog-value').textContent = `${p.progress}%`;
  $('#fill').style.width = `${Number(p.progress) || 0}%`;
  $('#track').setAttribute('aria-valuenow', p.progress);

  document.body.dataset.status = p.status;

  const tl = p.timeline || {};
  const chips = [
    `<span class="meta-chip badge-chip ${esc(p.status)}">${esc(t(st[p.status], lang) || p.status)}</span>`,
    t(p.role, lang) ? `<span class="meta-chip">${esc(L('role'))}: ${esc(t(p.role, lang))}</span>` : '',
    tl.start ? `<span class="meta-chip">${esc(L('start'))} ${esc(tl.start)}</span>` : '',
    `<span class="meta-chip">${esc(L('target'))} ${esc(tl.target || L('tbd'))}</span>`,
    p.lastCommit ? `<span class="meta-chip">${esc(L('lastCommit'))} ${esc(p.lastCommit)}</span>` : '',
    p.commits ? `<span class="meta-chip">${esc(p.commits)} ${esc(L('commits'))}</span>` : '',
    p.repo ? `<a class="meta-chip link" href="${esc(p.repo)}" target="_blank" rel="noopener">${esc(L('repo'))} ↗</a>` : '',
    p.extraLink ? `<a class="meta-chip link" href="${esc(p.extraLink.href)}">${esc(t(p.extraLink.label, lang))} →</a>` : ''
  ].filter(Boolean).join('');

  $('#hero-chips').innerHTML = chips;
  $('#tags').innerHTML = (p.tags || []).map((x) => `<span class="tag">${esc(x)}</span>`).join('');
  $('#foot').innerHTML = L('foot');
}

function renderAll() {
  renderHead();
  renderSections();
}

/* ---------- controles ---------- */

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
  if (state.detail) renderAll();
});

/* ---------- arranque ---------- */

function fail(html) {
  $('#sections').innerHTML = `<section class="sheet"><h2>—</h2><p>${html}</p></section>`;
}

const id = new URLSearchParams(location.search).get('id') || '';

const getJSON = (url) => fetch(url, { cache: 'no-store' }).then((r) => {
  if (!r.ok) throw new Error(`${url}: ${r.status} ${r.statusText}`);
  return r.json();
});

getJSON('data/projects.json')
  .then((data) => {
    const p = data.projects.find((x) => x.id === id);
    if (!p) throw new Error('__notfound__');
    state.project = p;
    state.ui = data.ui;
    return getJSON(`data/details/${encodeURIComponent(id)}.json`);
  })
  .then((detail) => {
    state.detail = detail;
    renderAll();
    /* Si la URL trae un ancla, hay que repetir el salto: el contenido no existía al cargar. */
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) target.scrollIntoView();
    }
  })
  .catch((err) => {
    if (err.message === '__notfound__') return fail(esc(L('notFound')));
    fail(`${esc(err.message)} — ${L('localNote')}`);
  });
