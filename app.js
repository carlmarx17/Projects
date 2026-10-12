/* Tablero de proyectos — carga data/projects.json y pinta las tarjetas. */

const $ = (sel) => document.querySelector(sel);

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const slug = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, '');

let state = { data: null, filter: 'todos', query: '' };

/* ---------- tema ---------- */

try {
  const saved = localStorage.getItem('tablero-tema');
  if (saved) document.documentElement.dataset.theme = saved;
} catch (e) { /* storage bloqueado: se usa el tema del sistema */ }

$('#theme').addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('tablero-tema', root.dataset.theme); } catch (e) { /* no persiste */ }
});

/* ---------- render ---------- */

function renderStats(projects) {
  const n = projects.length;
  const activos = projects.filter((p) => ['activo', 'en curso'].includes(p.status)).length;
  const avg = n ? Math.round(projects.reduce((a, p) => a + (p.progress || 0), 0) / n) : 0;
  const hitos = projects.flatMap((p) => p.milestones || []);
  const hechos = hitos.filter((m) => m.done).length;

  const cells = [
    ['Proyectos', n],
    ['En movimiento', activos],
    ['Avance medio', avg + '%'],
    ['Hitos cumplidos', `${hechos}/${hitos.length}`]
  ];

  $('#stats').innerHTML = cells
    .map(([k, v]) => `<div class="stat"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join('');
}

function renderFilters(projects) {
  const states = ['todos', ...new Set(projects.map((p) => p.status))];
  $('#filters').innerHTML = states.map((s) => `
    <button class="chip" type="button" data-filter="${esc(s)}"
            aria-pressed="${s === state.filter}">${esc(s)}</button>`).join('');

  $('#filters').querySelectorAll('.chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.filter = btn.dataset.filter;
      renderFilters(projects);
      renderGrid();
    });
  });
}

function card(p) {
  const ms = (p.milestones || []).map((m) => `
    <li class="${m.done ? 'done' : 'todo'}">
      <span class="mark" aria-hidden="true">${m.done ? '✓' : '○'}</span>
      <span>${esc(m.label)}</span>
    </li>`).join('');

  const tags = (p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('');

  const next = p.next
    ? `<p class="note"><b>Siguiente paso</b>${esc(p.next)}</p>` : '';
  const blockers = p.blockers
    ? `<p class="note blocker"><b>Bloqueo</b>${esc(p.blockers)}</p>` : '';

  const repo = p.repo
    ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">repositorio ↗</a>`
    : '<span>sin repositorio</span>';

  const last = p.lastCommit
    ? `último commit ${esc(p.lastCommit)}${p.commits ? ` · ${esc(p.commits)} commits` : ''}`
    : 'sin control de versiones';

  return `
  <article class="card s-${slug(p.status)}">
    <div class="card-top">
      <span class="area">${esc(p.area)}</span>
      <span class="badge ${slug(p.status)}">${esc(p.status)}</span>
    </div>

    <h2>${esc(p.name)}</h2>
    <p class="short">${esc(p.short)}</p>
    <p class="summary">${esc(p.summary)}</p>

    <div class="prog-head"><span>avance</span><b>${esc(p.progress)}%</b></div>
    <div class="track" role="progressbar" aria-valuenow="${esc(p.progress)}"
         aria-valuemin="0" aria-valuemax="100"
         aria-label="Avance de ${esc(p.name)}">
      <div class="fill" style="width:${Number(p.progress) || 0}%"></div>
    </div>

    <ul class="ms">${ms}</ul>
    ${next}
    ${blockers}
    <div class="tags">${tags}</div>

    <div class="card-foot">
      <span>${last}</span>
      ${repo}
    </div>
  </article>`;
}

function renderGrid() {
  const q = state.query.trim().toLowerCase();
  const list = state.data.projects.filter((p) => {
    const okState = state.filter === 'todos' || p.status === state.filter;
    const hay = [p.name, p.short, p.area, p.summary, ...(p.tags || [])]
      .join(' ').toLowerCase();
    return okState && (!q || hay.includes(q));
  });

  $('#grid').innerHTML = list.map(card).join('');
  $('#empty').hidden = list.length > 0;
}

/* ---------- arranque ---------- */

fetch('data/projects.json', { cache: 'no-store' })
  .then((r) => {
    if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
    return r.json();
  })
  .then((data) => {
    state.data = data;
    const byProgress = [...data.projects].sort((a, b) => {
      const rank = (s) => ({ 'activo': 0, 'en curso': 1, 'bloqueado': 2, 'pausado': 3 }[s] ?? 9);
      return rank(a.status) - rank(b.status) || b.progress - a.progress;
    });
    data.projects = byProgress;

    $('#owner').textContent = data.owner;
    $('#subtitle').textContent = data.subtitle || '';
    $('#updated').textContent = data.updated || '—';
    document.title = `${data.owner} — ${data.subtitle || 'Proyectos'}`;

    renderStats(data.projects);
    renderFilters(data.projects);
    renderGrid();
  })
  .catch((err) => {
    $('#grid').innerHTML = `<article class="card"><h2>No se pudo cargar data/projects.json</h2>
      <p class="summary">${esc(err.message)}. Si abriste el archivo con doble clic,
      el navegador bloquea la lectura local: levanta un servidor con
      <code>python3 -m http.server</code> en esta carpeta.</p></article>`;
  });

$('#search').addEventListener('input', (e) => {
  state.query = e.target.value;
  if (state.data) renderGrid();
});
