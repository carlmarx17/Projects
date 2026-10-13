# Tablero de proyectos · Project dashboard

Página estática bilingüe (ES/EN) con el estado de avance de mis proyectos.
HTML, CSS y JavaScript sin dependencias: se publica tal cual.

*Bilingual (ES/EN) static page tracking the progress of my projects. Plain HTML,
CSS and JavaScript, no dependencies.*

**En vivo · Live: <https://carlmarx17.github.io/Projects/>**

## Verla en local · Run it locally

El navegador bloquea `fetch` sobre archivos locales, así que no basta el doble clic:

```bash
cd "~/Documents/Dynsdun Projects/Projects" && python3 -m http.server 8000
```

Luego <http://localhost:8000>. El idioma y el tema se recuerdan en el navegador.

## Estructura de los datos · Data structure

Todo el contenido vive en [`data/projects.json`](data/projects.json); el HTML no
se toca nunca. El archivo tiene tres partes:

- `meta` — nombre, subtítulo y fecha de actualización.
- `ui` — las cadenas de la interfaz y las etiquetas de estado, en ambos idiomas.
- `projects` — un objeto por proyecto.

**Cualquier campo de texto es bilingüe**: se escribe como `{ "es": "…", "en": "…" }`.
Si se pone un string suelto, se usa igual en los dos idiomas.

### Campos de cada proyecto

| Campo | Qué es |
|---|---|
| `short` | nombre corto de la carpeta o repo (no se traduce) |
| `status` | clave de estado: `active`, `in-progress`, `intermittent`, `paused`, `blocked` |
| `progress` | 0–100, la barra de avance |
| `name`, `area`, `role` | título, categoría y rol en el proyecto |
| `summary` | dos o tres líneas de qué es |
| `objective` | **Objetivo**: qué pregunta responde o qué entrega |
| `timeline` | **Tiempo**: `start`, `target` (`null` = por definir) y `note` con el contexto |
| `activity30d` | commits en los últimos 30 días, lo rellena el script |
| `resources` | **Recursos**: lista de lo que el proyecto consume (cómputo, software, datos, gente) |
| `steps` | **Pasos**: lista de `{ done, label, detail }`; `detail` es la línea que explica el paso |
| `expected` | **Resultado esperado**: con qué se cierra el proyecto |
| `next` | el siguiente paso concreto |
| `blockers` | lo que está trabando el proyecto (vacío = no se muestra) |
| `repo` | URL del repositorio (vacío = "sin repositorio") |
| `path` | ruta relativa al repo local, solo la usa el script de refresco |
| `tags` | herramientas y métodos |
| `extraLink` | opcional: `{ href, label }` para enlazar una página propia del proyecto dentro de este sitio |

El desglose largo de cada proyecto no va aquí: vive en `data/details/<id>.json`
(ver más abajo), para que este archivo siga siendo legible de una pasada.

Para añadir un proyecto, copia un bloque y cámbialo. Los estados nuevos aparecen
solos como filtro, pero necesitan su etiqueta en `ui.status` y, si quieres color
propio, una regla `.badge.<estado>` en `styles.css`.

### Añadir un tercer idioma

Agrega la clave (`"fr": "…"`) a los campos que quieras y amplía el botón de idioma
en `app.js`. La función `t()` cae a `es` y luego a `en` si falta una traducción,
así que un idioma incompleto no rompe la página.

## El desglose de cada proyecto

Cada tarjeta enlaza a `proyecto.html?id=<id>`, una página de desglose larga que
explica el proyecto a fondo: la pregunta, el método paso a paso, los parámetros
con números, el estado real, los límites, un glosario y las **referencias**, cada
una con qué establece y para qué se usa en el proyecto.

La plantilla es una sola ([`proyecto.html`](proyecto.html) + [`proyecto.js`](proyecto.js)).
La cabecera se arma con `data/projects.json` — estado, avance, fechas, commits, repo —
y el contenido largo sale de `data/details/<id>.json`. Así no hay dos verdades: el
estado se edita en un sitio solo.

### Estructura de `data/details/<id>.json`

```json
{
  "id": "graz",
  "lede": { "es": "…", "en": "…" },
  "sections": [
    { "id": "pregunta",
      "title": { "es": "1 · …", "en": "1 · …" },
      "blurb": { "es": "…", "en": "…" },
      "blocks": [ { "type": "prose", "text": [ { "es": "…", "en": "…" } ] } ] }
  ]
}
```

`id` tiene que coincidir con el `id` del proyecto en `projects.json`. El `id` de
cada sección es su ancla (`proyecto.html?id=graz#s-pregunta`) y su entrada en el
índice lateral. Los tipos de bloque disponibles:

| `type` | Qué es | Campos |
|---|---|---|
| `prose` | párrafos | `text`: lista de textos bilingües |
| `list` | lista con viñetas o numerada | `items`, `ordered` |
| `defs` | glosario o definiciones | `items`: `{ term, def }` |
| `kv` | pares clave/valor, para parámetros | `items`: `{ k, v }` |
| `table` | tabla con cabecera | `head`, `rows`, `note` |
| `steps` | pasos con marca de hecho/pendiente | `items`: `{ done, label, detail }` |
| `timeline` | hitos o decisiones en el tiempo | `items`: `{ state, tag, when, title, body }`; `state` es `kept`, `dropped` o `current` |
| `callout` | aviso destacado | `variant` (`note`, `warn`, `ok`), `title`, `text`, `items` |
| `code` | bloque de código o una fórmula | `text` (sin formato), `note` |
| `refs` | bibliografía | `items`: `{ cite, venue, what, use, links: [{ href, label }] }` |

Dentro de cualquier texto funcionan tres marcas: `` `código` ``, `**negrita**` y
`[enlace](https://…)`. Se aplican **después** de escapar el HTML, así que nada de
lo que haya en el JSON puede inyectar marcado.

Una referencia sin `links` se muestra igual, con la nota de que no tiene enlace
público: es la forma de citar algo que no se pudo abrir, sin fingir que sí.

## Páginas propias de un proyecto

Además del desglose, un proyecto puede tener una página hecha a medida y
enlazarla desde la tarjeta con `extraLink`. La que existe hoy:

- [`graz-decisiones.html`](graz-decisiones.html) — árbol de decisiones de GrazTrabajo:
  cómo el proyecto llegó a su estado actual a lo largo de cinco redefiniciones,
  las rutas de solver y la revisión R1. Bilingüe, con sus textos en
  `graz-decisiones.js` y los estilos compartidos de `styles.css`.

## Refrescar los datos de git

Rellena `lastCommit`, `commits` y la fecha de actualización desde los repos locales
que apunta cada `path`:

```bash
cd "~/Documents/Dynsdun Projects/Projects" && python3 scripts/refresh_git.py
```

El avance, los pasos y los textos no se tocan: eso lo juzgas tú.

## Publicar · Publishing

El sitio está publicado en <https://carlmarx17.github.io/Projects/> desde el
repositorio público [carlmarx17/Projects](https://github.com/carlmarx17/Projects),
con **Settings → Pages → Deploy from a branch → `main` / root**.

Cada push a `main` dispara el workflow `pages-build-deployment` y el sitio se
actualiza en un minuto o dos. El archivo vacío `.nojekyll` en la raíz le dice a
Pages que sirva los archivos tal cual, sin pasarlos por Jekyll: no hay plantillas
que procesar y así ningún nombre de archivo con guion bajo se pierde por el camino.

Como el repositorio es público, **todo lo que escribas en `projects.json` es
visible**, incluidos los bloqueos y los pasos pendientes. Si algo no debe salir de
tu máquina, no lo pongas ahí.

### Si el sitio no se actualiza

Que un push no dispare el build es un fallo conocido de Pages. En orden:

1. Mira la pestaña **Actions**: si el run está en `queued` y no arranca, suele
   resolverse solo.
2. En **Settings → Pages**, pon la fuente en *None*, guarda, y vuelve a
   *Deploy from a branch* → `main` / root. Eso vuelve a registrar el disparador.
3. Si eso reencola un build de un commit viejo en vez de crear uno nuevo, fuerza
   uno del commit actual:

   ```bash
   git commit --allow-empty -m "Disparar el despliegue de Pages" && git push
   ```

## Nota sobre los porcentajes

Los valores de `progress` son una estimación a partir de los README y del historial
de git de cada proyecto, no una medida. Ajústalos.
