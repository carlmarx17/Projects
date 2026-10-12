/* Árbol de decisiones de GrazTrabajo — bilingüe ES/EN.
   Reconstruido del historial de git y de docs/, docs/archive/ del propio repositorio.
   GrazTrabajo decision tree — bilingual ES/EN, reconstructed from the repo's own
   git history and its docs/ and docs/archive/ files. */

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

let lang = 'es';
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* no persiste */ } }
};

const savedTheme = store.get('tablero-tema');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
const savedLang = store.get('tablero-idioma');
if (savedLang === 'es' || savedLang === 'en') lang = savedLang;

const T = {
  title:    { es: 'Árbol de decisiones', en: 'Decision tree' },
  subtitle: { es: 'GrazTrabajo · Memoria atmosférica bajo pulsos repetidos de electrones',
              en: 'GrazTrabajo · Atmospheric memory under repeated electron pulses' },
  back:     { es: '← Tablero de proyectos', en: '← Project dashboard' },
  lede: {
    es: 'Cómo el proyecto llegó a su estado actual. En tres semanas la pregunta se redefinió cinco veces: cada versión se descartó por una razón concreta, no por cambio de gusto, y cada descarte dejó algo que la siguiente aprovechó. Reconstruido del historial de git y de los planes archivados del propio repositorio.',
    en: 'How the project reached its current state. In three weeks the question was redefined five times: each version was dropped for a concrete reason rather than a change of taste, and each one left something the next reused. Reconstructed from the repository’s own git history and archived plans.'
  },
  legend: {
    kept:    { es: 'línea que siguió', en: 'line that continued' },
    dropped: { es: 'descartada, con motivo', en: 'dropped, with a reason' },
    current: { es: 'estado actual', en: 'current state' }
  },
  verdict: {
    kept:    { es: 'continúa', en: 'continued' },
    dropped: { es: 'descartada', en: 'dropped' },
    current: { es: 'estado actual', en: 'current state' }
  },
  whyLabel:  { es: 'Por qué se descartó', en: 'Why it was dropped' },
  keptLabel: { es: 'Qué fijó', en: 'What it settled' },
  foot: {
    es: 'Reconstruido el 12 de octubre de 2026 del historial de <code>carlmarx17/GrazTrabajo</code>: 18 commits entre el 18 de septiembre y el 12 de octubre, los planes v2, v3 y v4 archivados en <code>docs/archive/</code>, el plan activo v5.1 y el informe del piloto <code>docs/07</code>.',
    en: 'Reconstructed on 12 October 2026 from the history of <code>carlmarx17/GrazTrabajo</code>: 18 commits between 18 September and 12 October, the v2, v3 and v4 plans archived in <code>docs/archive/</code>, the active v5.1 plan and the pilot report <code>docs/07</code>.'
  },
  solverTitle: { es: 'En paralelo: qué código usar', en: 'In parallel: which code to use' },
  r1Q:  { es: 'Pregunta de la revisión R1', en: 'R1 review question' },
  r1A:  { es: 'Respuesta del piloto', en: 'What the pilot answered' },
  pendingTitle: { es: 'Lo que Fase 1 necesita antes del mapa τ × F', en: 'What Phase 1 needs before the τ × F map' },
  limitsTitle:  { es: 'Lo que esta ruta no puede entregar', en: 'What this route cannot deliver' }
};

const NODES = [
  {
    state: 'dropped', ver: 'v1', when: '2026-09-18 → 2026-10-01',
    q: { es: '¿Qué tan grande es la memoria cromosférica tras un segundo o tercer pulso?',
         en: 'How large is the chromospheric memory after a second or third pulse?' },
    why: { es: 'La respuesta era casi segura de antemano — la memoria existe — y ya estaba publicada (Kennedy et al. 2015). Una pregunta cuya respuesta se conoce antes de simular no justifica el trabajo.',
           en: 'The answer was near-certain in advance — memory exists — and already published (Kennedy et al. 2015). A question whose answer is known before simulating does not justify the work.' }
  },
  {
    state: 'dropped', ver: 'v2', when: '2026-10-02',
    q: { es: '¿Cuánto sesga esa memoria los parámetros de electrones (Ṅ, E_c, δ) que se infieren con STIX?',
         en: 'How much does that memory bias the electron parameters (Ṅ, E_c, δ) inferred with STIX?' },
    why: { es: 'Se puso una compuerta antes de gastar tiempo de clúster: si la columna coronal resultaba menor al 10% de la columna de frenado, la idea perdía base. Se probó el 3 de octubre con un modelo de juguete inyectar–reinferir y un test de columna en HYDRAD. El efecto resultó real pero pequeño y condicionado a fulguraciones brillantes: como artículo propio habría sido una nota metodológica sobre un efecto ya conocido. No se tiró: quedó como el componente de modelado directo de v3.',
           en: 'A gate was set before spending cluster time: if the coronal column came out below 10% of the stopping column, the idea lost its basis. It was tested on 3 October with a toy inject–reinfer model and a HYDRAD column test. The effect turned out real but small and conditional on bright flares: as a paper of its own it would have been a methods note on an already known effect. It was not thrown away: it stayed as the forward-modelling component of v3.' }
  },
  {
    state: 'dropped', ver: 'v3', when: '2026-10-03',
    q: { es: '¿Se puede separar memoria del blanco, corriente de retorno y aceleración mirando cómo evoluciona el espectro en el tiempo?',
         en: 'Can target memory, return current and acceleration be separated by how the spectrum evolves in time?' },
    why: { es: 'Los tres procesos dejan huellas distintas en el tiempo, así que la idea era usar esa dependencia temporal para discriminarlos. Pero los tamaños de efecto quedaban cerca de los sistemáticos, y sin control espacial el tiempo y la energía ya depositada son colineales: no se pueden separar.',
           en: 'The three processes leave different fingerprints in time, so the idea was to use that time dependence to tell them apart. But the effect sizes landed near the systematics, and without spatial control, time and already-deposited energy are collinear: they cannot be separated.' }
  },
  {
    state: 'dropped', ver: 'v4', when: '2026-10-04',
    q: { es: '¿Los pulsos posteriores reutilizan los bucles ya llenos? Usar el plasma evaporado como trazador de los caminos de los electrones.',
         en: 'Do later pulses re-use the already filled loops? Use the evaporated plasma as a tracer of the electron paths.' },
    why: { es: 'Era el diseño más decisivo hasta entonces: medir la fracción φ de electrones que reutiliza bucles llenos, con una cota superior robusta. Cayó en un punto técnico el 5 de octubre: la medida de emisión por sí sola no establece una cota inferior de la columna a lo largo de los caminos de los electrones cuando la fuente no está resuelta y no es uniforme. Sin esa cota, el trazador no mide lo que prometía.',
           en: 'It was the most decisive design so far: measure the fraction φ of electrons re-using filled loops, with a robust upper bound. It fell on a technical point on 5 October: emission measure alone does not establish a lower bound on the column along the electron paths when the source is unresolved and nonuniform. Without that bound, the tracer does not measure what it promised.' }
  },
  {
    state: 'kept', ver: 'v5 → v5.1', when: '2026-10-05',
    q: { es: '¿Cuándo falla la aproximación de pulsos independientes?',
         en: 'When does the independent-pulse approximation fail?' },
    why: { es: 'v5 se estrechó a su núcleo tras una revisión crítica interna. El diseño: cuatro ramas pareadas — A0 sin haz, A1 solo el primer pulso, B0 el pulso de prueba sobre la atmósfera relajada, B1 el primer pulso más espera τ más el de prueba — y el contraste M_D(τ, t′) entre ellas. Dos candados que fijan el resultado de antemano: la regla de decisión |M_D| > k·σ_tot, con σ_tot escrito antes de calcular ningún contraste, y la relajación juzgada comparando A1 contra A0, no exigiendo que M_D tienda a cero.',
           en: 'v5 was narrowed to its core after an internal critical review. The design: four paired branches — A0 no beam, A1 the first pulse only, B0 the test pulse on the relaxed atmosphere, B1 the first pulse plus waiting time τ plus the test pulse — and the contrast M_D(τ, t′) between them. Two locks that fix the result in advance: the decision rule |M_D| > k·σ_tot, with σ_tot written down before any contrast is computed, and relaxation judged by comparing A1 against A0 rather than by requiring M_D to tend to zero.' },
    keptNote: true
  },
  {
    state: 'kept', ver: 'piloto · pilot', when: '2026-10-05 → 2026-10-12',
    q: { es: 'Piloto con HYDRAD en bucles de 26 y 60 Mm: ¿se sostiene numéricamente?',
         en: 'HYDRAD pilot on 26 and 60 Mm loops: does it hold up numerically?' },
    why: { es: 'Dos ajustes lo hicieron viable. El factor de seguridad de conducción bajó a 0.2, que cura la inestabilidad; y la cromosfera pasó de los 5 Mm que trae HYDRAD a 8 Mm, lo que amplió la ventana de conservación de masa. Resultado: τ = 10, 30 y 60 s corren limpios sobre la ventana completa de 89 s, unas 2 h en 6 núcleos. τ = 120 s no sirve — su rama B1 desarrolla la oscilación de escala de malla en cuanto arranca el pulso de prueba.',
           en: 'Two adjustments made it viable. The conduction safety factor dropped to 0.2, which cures the instability; and the chromosphere went from the 5 Mm HYDRAD ships to 8 Mm, which widened the mass-conservation window. Result: τ = 10, 30 and 60 s run cleanly over the full 89 s window, about 2 h on 6 cores. τ = 120 s is unusable — its B1 branch develops the grid-scale oscillation as soon as the test pulse starts.' },
    keptNote: true
  }
];

const SOLVER = [
  { when: '2026-10-02', es: 'El piloto de HYDRAD corre limpio con las tablas de pulso rampado.',
    en: 'The HYDRAD pilot runs cleanly with the ramped pulse tables.' },
  { when: '2026-10-02', es: 'Se adopta RADYN como solver único.',
    en: 'RADYN is adopted as the single solver.' },
  { when: '2026-10-03', rev: true,
    es: 'Se revierte al día siguiente: se separan atmósfera y transporte. HYDRAD para la atmósfera, y el solver Fokker–Planck de código abierto para el transporte y los fotones, de modo que ningún código único sea el cuello de botella.',
    en: 'Reversed the next day: atmosphere and transport are split. HYDRAD for the atmosphere, and the open-source Fokker–Planck solver for transport and photons, so that no single code is the bottleneck.' },
  { when: '2026-10-12', es: 'La ruta RADYN sigue sin estar al alcance: ninguno de los seis puntos de la compuerta está hecho — sin compilador Fortran, sin la librería CDF de la NASA, sin reproducir un modelo F-CHROMA y con la licencia sin confirmar. La distribución se ha leído, no ejecutado.',
    en: 'The RADYN route is still out of reach: none of the six gate items is done — no Fortran compiler, no NASA CDF library, no F-CHROMA model reproduced and the licence unconfirmed. The distribution has been read, not run.' }
];

const R1 = [
  { q: { es: '¿Corren limpias las cuatro ramas?', en: 'Do the four branches run cleanly?' },
    a: { es: '<span class="yes">Sí</span>, para τ = 10, 30 y 60 s. τ = 120 s no.',
         en: '<span class="yes">Yes</span>, for τ = 10, 30 and 60 s. τ = 120 s no.' } },
  { q: { es: '¿Son idénticos los estados previos al pulso de prueba?', en: 'Are the pre-test states identical?' },
    a: { es: '<span class="yes">Por construcción</span>: B1 reinicia desde el perfil de A1 justo antes de t_k, así que comparten una trayectoria en vez de ser dos corridas que deban coincidir. El reinicio cuesta un 2% del |M| pico en la medida de emisión y un 13% de su contraste en la columna coronal.',
         en: '<span class="yes">By construction</span>: B1 restarts from the A1 profile just before t_k, so they share one trajectory instead of being two runs that must agree. The restart costs 2% of the peak |M| for the emission measure and 13% of its contrast for the coronal column.' } },
  { q: { es: '¿Hay contraste por encima de σ_num en algún proxy?', en: 'Is a contrast above σ_num for at least one proxy?' },
    a: { es: '<span class="yes">Sí, en cuatro</span>: 9 σ_num en la medida de emisión caliente, 21 σ_num en la temperatura pesada por EM, 9 σ_num en la temperatura del ápice y 9 σ_num en su densidad. Solo falla la columna coronal, porque su umbral de 3×10⁴ K cae sobre las condensaciones y el suelo de radiación.',
         en: '<span class="yes">Yes, for four</span>: 9 σ_num for the hot emission measure, 21 σ_num for the EM-weighted temperature, 9 σ_num for the apex temperature and 9 σ_num for its density. Only the coronal column fails, because its 3×10⁴ K threshold sits on the condensations and the radiation floor.' } },
  { q: { es: '¿Está la ruta RADYN al alcance?', en: 'Is a RADYN route within reach?' },
    a: { es: '<span class="no">Todavía no.</span> Es un problema de cadena de herramientas y licencia, no de física.',
         en: '<span class="no">Not yet.</span> It is a toolchain and licence problem, not a physics one.' } }
];

const DECISION = {
  ver: 'R1', when: '2026-10-12',
  q: { es: 'Decisión: continuar el mapa central con HYDRAD y proxies coronales',
       en: 'Decision: continue the core map with HYDRAD and coronal proxies' },
  why: {
    es: 'Se eligió la opción (a), con la compuerta de RADYN en paralelo y no como prerrequisito. Tres razones: el contraste no es un residuo numérico — supera 3(σ_num ⊕ σ_beam) y tiene mecanismo, porque la corona ya está llena, el haz frena en ella, el ápice se calienta menos y la emisión caliente no necesita esperar a la evaporación; dos configuraciones independientes, 26 y 60 Mm con distintos ajustes de radiación, dan el mismo signo, así que no lo está guiando el tratamiento numérico; y hacer esperar el núcleo a RADYN estancaría la Fase 1 por un problema de compilador y licencia. Las opciones (b) y (c) no se rechazan, se aplazan: son la ruta al diagnóstico cromosférico, que es la segunda mitad natural de la pregunta. La opción (d), abandonar, no aplica, porque M no está por debajo de σ_num.',
    en: 'Option (a) was chosen, with the RADYN gate running in parallel rather than as a prerequisite. Three reasons: the contrast is not a numerical residue — it exceeds 3(σ_num ⊕ σ_beam) and it has a mechanism, because the corona is already filled, the beam stops in it, the apex warms less and the hot emission needs no evaporation delay; two independent configurations, 26 and 60 Mm with different radiation settings, give the same signs, so the numerical treatment is not driving it; and making the core wait on RADYN would stall Phase 1 over a compiler and licence problem. Options (b) and (c) are not rejected but deferred: they are the route to a chromospheric diagnostic, the natural second half of the question. Option (d), abandoning, does not apply, because M is not below σ_num.'
  }
};

const PENDING = [
  { es: '<b>σ_num espacial.</b> Falta variar los umbrales de refinamiento, no solo el paso de conducción. Hasta entonces el presupuesto de error está incompleto, y de ahí depende si el segundo episodio de A1 entre t ≈ 85 y 130 s es dinámica del bucle o un artefacto de resolución.',
    en: '<b>Spatial σ_num.</b> The refinement thresholds still have to be varied, not only the conduction step. Until then the error budget is incomplete, and whether A1’s second episode between t ≈ 85 and 130 s is loop dynamics or a resolution artefact depends on it.' },
  { es: '<b>σ_obs y decisión pre-registrada.</b> Los contrastes actuales son exploratorios por construcción: falta σ_obs y los σ se midieron después de calcular los contrastes, lo que invierte el orden que exige el plan.',
    en: '<b>σ_obs and a pre-registered decision.</b> The current contrasts are exploratory by construction: σ_obs is missing and the σ values were measured after computing the contrasts, which inverts the order the plan requires.' },
  { es: '<b>Una malla de τ que alcance la relajación.</b> El criterio del 5% falla en todos los τ muestreados, así que τ* > 120 s para este bucle y este haz: el piloto no puede acotarlo por arriba.',
    en: '<b>A τ grid that reaches relaxation.</b> The 5% criterion fails at every sampled τ, so τ* > 120 s for this loop and beam: the pilot cannot bound it from above.' },
  { es: '<b>Un diagnóstico primario, elegido por robustez.</b> La medida de emisión caliente y la temperatura pesada por EM son el par estable; los diagnósticos puntuales del ápice cambian de signo y la columna coronal no pasa σ_num.',
    en: '<b>One primary diagnostic, chosen on robustness.</b> The hot emission measure and the EM-weighted temperature are the stable pair; the apex point diagnostics change sign and the coronal column fails σ_num.' },
  { es: '<b>El límite de degeneración del haz, como resultado.</b> Cerca del final del pulso, un haz variado dentro de sus errores de ajuste de STIX mueve la medida de emisión tanto como la historia. Eso es un hallazgo sobre el diagnóstico, no un defecto de la corrida.',
    en: '<b>The beam-degeneracy limit, stated as a result.</b> Near the end of the pulse, a beam varied within its STIX fit errors moves the emission measure as much as history does. That is a finding about the diagnostic, not a defect of the run.' }
];

const LIMITS = [
  { es: 'Nada cromosférico. El calentamiento es analítico y las pérdidas ópticamente delgadas, sin transferencia NLTE: Mg II, Si IV o Hα exigen RADYN o un colaborador.',
    en: 'No chromospheric claim. The heating is analytic and the losses optically thin, with no NLTE transfer: Mg II, Si IV or Hα need RADYN or a collaborator.' },
  { es: 'Nada por encima de 5×10¹⁰ erg cm⁻² s⁻¹: el paso de conducción estable no curó esos fallos, así que el eje de flujo queda muy por debajo de la malla F-CHROMA.',
    en: 'Nothing at or above 5×10¹⁰ erg cm⁻² s⁻¹: the stable conduction step did not cure those failures, so the flux axis stays well below the F-CHROMA grid.' },
  { es: 'Las condensaciones y el vaivén son propiedades del modelo: los flujos de evaporación que chocan en un bucle 1D simétrico las producen en toda configuración que sobrevive.',
    en: 'Condensations and sloshing are model properties: the colliding evaporation flows of a symmetric 1D loop produce them in every surviving configuration.' },
  { es: 'Un bucle y una forma de haz. Nada aquí separa la historia de la longitud del bucle, de la forma del pulso o de la asimetría.',
    en: 'One loop and one beam shape. Nothing here separates history from loop length, from pulse shape or from asymmetry.' }
];

/* ---------- render ---------- */

function renderNode(n) {
  const label = n.state === 'kept' ? T.keptLabel : T.whyLabel;
  return `<li class="node ${n.state}">
    <div class="box">
      <div class="box-head">
        <span class="ver">${esc(n.ver)}</span>
        <span class="when">${esc(n.when)}</span>
        <span class="verdict ${n.state}">${esc(T.verdict[n.state][lang])}</span>
      </div>
      <p class="q">${esc(n.q[lang])}</p>
      <p class="why"><b>${esc(label[lang])}</b>${esc(n.why[lang])}</p>
    </div>
  </li>`;
}

function renderSolver() {
  const steps = SOLVER.map((s) => `
    <div class="aside-step${s.rev ? ' ' : ''}">
      <b class="${s.rev ? 'rev' : ''}">${esc(s.when)}</b> — ${esc(s[lang])}
    </div>`).join('');
  return `<li class="node kept">
    <div class="box">
      <div class="box-head"><span class="ver">↳</span></div>
      <div class="aside-track">
        <h4>${esc(T.solverTitle[lang])}</h4>
        ${steps}
      </div>
    </div>
  </li>`;
}

function renderDecision() {
  const rows = R1.map((r) => `<tr><td>${esc(r.q[lang])}</td><td>${r.a[lang]}</td></tr>`).join('');
  const pending = PENDING.map((x) => `<li>${x[lang]}</li>`).join('');
  const limits = LIMITS.map((x) => `<li>${esc(x[lang])}</li>`).join('');

  return `<li class="node current">
    <div class="box">
      <div class="box-head">
        <span class="ver">${esc(DECISION.ver)}</span>
        <span class="when">${esc(DECISION.when)}</span>
        <span class="verdict current">${esc(T.verdict.current[lang])}</span>
      </div>
      <p class="q">${esc(DECISION.q[lang])}</p>

      <table class="r1">
        <thead><tr><th>${esc(T.r1Q[lang])}</th><th>${esc(T.r1A[lang])}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <p class="why" style="margin-top:12px"><b>${esc(T.verdict.current[lang])}</b>${esc(DECISION.why[lang])}</p>

      <h4 style="margin:16px 0 0;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:var(--faint)">
        ${esc(T.pendingTitle[lang])}</h4>
      <ol class="pending">${pending}</ol>

      <div class="limits"><b>${esc(T.limitsTitle[lang])}</b><ul>${limits}</ul></div>
    </div>
  </li>`;
}

function render() {
  document.documentElement.lang = lang;
  $('#lang-label').textContent = lang === 'es' ? 'EN' : 'ES';
  $('#back').textContent = T.back[lang];
  $('#title').textContent = T.title[lang];
  $('#subtitle').textContent = T.subtitle[lang];
  $('#lede').textContent = T.lede[lang];
  $('#foot').innerHTML = T.foot[lang];
  document.title = `${T.title[lang]} — GrazTrabajo`;

  $('#legend').innerHTML = ['kept', 'dropped', 'current']
    .map((k) => `<span><i class="dot ${k}"></i>${esc(T.legend[k][lang])}</span>`).join('');

  const parts = [];
  NODES.forEach((n, i) => {
    parts.push(renderNode(n));
    if (i === 1) parts.push(renderSolver());   // la rama de solver cuelga después de v2
  });
  parts.push(renderDecision());
  $('#tree').innerHTML = parts.join('');
}

$('#lang').addEventListener('click', () => {
  lang = lang === 'es' ? 'en' : 'es';
  store.set('tablero-idioma', lang);
  render();
});

$('#theme').addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  store.set('tablero-tema', root.dataset.theme);
});

render();
