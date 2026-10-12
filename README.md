# Tablero de proyectos

Página estática con el estado de avance de mis proyectos. HTML, CSS y JavaScript
sin dependencias: se publica tal cual en GitHub Pages.

## Cómo verla en local

El navegador bloquea `fetch` de archivos locales, así que no basta el doble clic:

```bash
cd ~/Documents/portafolio && python3 -m http.server 8000
```

Luego abre <http://localhost:8000>.

## Cómo actualizar el avance

Todo el contenido vive en [`data/projects.json`](data/projects.json). No hay que
tocar el HTML. Cada proyecto es un objeto:

| Campo | Qué es |
|---|---|
| `name`, `short` | título largo y nombre corto de la carpeta/repo |
| `area` | categoría que se muestra arriba de la tarjeta |
| `status` | `activo`, `en curso`, `pausado` o `bloqueado` (define color y filtro) |
| `progress` | 0–100, la barra de avance |
| `summary` | dos o tres líneas de qué es el proyecto |
| `milestones` | lista de `{ "label": …, "done": true/false }` |
| `next` | el siguiente paso concreto |
| `blockers` | lo que está trabando el proyecto (vacío = no se muestra) |
| `repo` | URL del repositorio (vacío = "sin repositorio") |
| `path` | ruta relativa al repo local, solo la usa el script de refresco |
| `tags` | herramientas o métodos |

Para añadir un proyecto, copia un bloque y cámbialo. Los estados nuevos aparecen
solos como filtro.

### Refrescar los datos de git

Los campos `lastCommit`, `lastCommitMsg` y `commits` se pueden rellenar
automáticamente desde los repos locales:

```bash
cd ~/Documents/portafolio && python3 scripts/refresh_git.py
```

El avance y los hitos no se tocan: esos los juzgas tú.

## Publicar en GitHub Pages

```bash
cd ~/Documents/portafolio && gh repo create portafolio --public --source=. --push
```

Después, en el repo: **Settings → Pages → Source: Deploy from a branch → `main` / `root`**.
Queda en `https://<usuario>.github.io/portafolio/`.

Si el tablero tiene notas internas que no quieres públicas, crea el repo
`--private` y usa GitHub Pages privado, o deja el tablero solo en local.

## Nota sobre los porcentajes

Los valores de `progress` del primer commit son una estimación hecha a partir de
los README y del historial de git de cada proyecto, no una medida. Ajústalos.
