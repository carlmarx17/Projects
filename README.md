# Tablero de proyectos · Project dashboard

Página estática bilingüe (ES/EN) con el estado de avance de mis proyectos.
HTML, CSS y JavaScript sin dependencias: se publica tal cual.

*Bilingual (ES/EN) static page tracking the progress of my projects. Plain HTML,
CSS and JavaScript, no dependencies.*

## Verla en local · Run it locally

El navegador bloquea `fetch` sobre archivos locales, así que no basta el doble clic:

```bash
cd ~/Documents/portafolio && python3 -m http.server 8000
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

Para añadir un proyecto, copia un bloque y cámbialo. Los estados nuevos aparecen
solos como filtro, pero necesitan su etiqueta en `ui.status` y, si quieres color
propio, una regla `.badge.<estado>` en `styles.css`.

### Añadir un tercer idioma

Agrega la clave (`"fr": "…"`) a los campos que quieras y amplía el botón de idioma
en `app.js`. La función `t()` cae a `es` y luego a `en` si falta una traducción,
así que un idioma incompleto no rompe la página.

## Refrescar los datos de git

Rellena `lastCommit`, `commits` y la fecha de actualización desde los repos locales
que apunta cada `path`:

```bash
cd ~/Documents/portafolio && python3 scripts/refresh_git.py
```

El avance, los pasos y los textos no se tocan: eso lo juzgas tú.

## Publicar · Publishing

El repositorio [carlmarx17/Projects](https://github.com/carlmarx17/Projects) es
privado, y **GitHub Pages no sirve repos privados sin plan de pago**. Las opciones:

- dejarlo privado y verlo en local con el servidor de arriba;
- hacerlo público — revisando antes qué notas internas (bloqueos, pasos pendientes)
  quieres que se vean — y activar **Settings → Pages → Deploy from a branch → `main` / root**.

## Nota sobre los porcentajes

Los valores de `progress` son una estimación a partir de los README y del historial
de git de cada proyecto, no una medida. Ajústalos.
