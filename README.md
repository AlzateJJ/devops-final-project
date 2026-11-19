# DevOps Atlas

Proyecto académico de Integración y Despliegue de Software. Responsable: Juan José Alzate.

Aplicación local HTML5, CSS y JavaScript con catálogo de herramientas, prácticas Essence y relaciones de uso. JSON y almacenamiento del navegador simulan la base de datos.

Incluye **144 herramientas**, **14 prácticas**, **19 diagramas Essence** y **42 relaciones de uso**. Permite registrar y actualizar los tres tipos de registros, buscar, filtrar, ampliar diagramas y respaldar/restaurar la base.

## Abrir la aplicación

Se requiere Node.js 20 o posterior y Google Chrome. No hace falta instalar paquetes para ejecutar la aplicación.

En Windows, abre **Iniciar.cmd**. Se iniciará un servidor local y se abrirá el navegador predeterminado. Si no es Chrome, copia `http://127.0.0.1:8765/app/` en Chrome. Mantén abierta la ventana del servidor mientras usas el proyecto.

También puedes ejecutar desde la raíz:

```sh
node scripts/serve.cjs
```

Abre `http://127.0.0.1:8765/app/`. No abras `app/index.html` directamente con `file://`: los módulos y el JSON necesitan un origen HTTP. Ctrl+C detiene el servidor. Se enlaza únicamente a `127.0.0.1`.

## Qué revisar

- [Guía de uso y recuperación](docs/guia.md).
- [Diseño y fases](docs/diseno.md).
- [Matriz de requisitos y evidencias](docs/matriz-requisitos.md).
- [Preparación de entrega](docs/entrega.md).
- [Backlog revisable](planificacion/backlog.html).
- [Tablero real de Trello](https://trello.com/b/5CSrY3pF/devops-tools-project): **42 tarjetas creadas y verificadas en Backlog**. Juan José Alzate aparece como responsable en cada descripción.

El almacenamiento está ligado al perfil y al origen del navegador. Exporta un respaldo antes de cambiar de equipo, borrar datos del navegador o usar otra dirección/puerto. No hay una base de datos remota ni sincronización entre equipos.

## Estructura

| Carpeta | Contenido |
|---|---|
| `app/` | HTML, CSS, módulos JavaScript y recursos locales |
| `app/data/database.json` | Base inicial; mismo contrato que localStorage y respaldos |
| `inventario/` | Inventario trazable, fuentes PDF y diagramas originales |
| `planificacion/` | Tarjetas y registro de publicación con enlaces reales |
| `docs/` | Diseño, guía, alcance y matriz de cumplimiento |
| `tests/`, `scripts/` | Pruebas, servidor y generación de datos/entrega |
| `evidencias/` | Reportes de pruebas y capturas |
| `entrega/` | ZIP, manifiesto de integridad e historial generado |

Los modelos comerciales de las 120 herramientas de la tabla se conservan como referencia del curso. Las 24 adicionales tienen una clasificación fechada con fuente oficial. Las 55 menciones complementarias/contextuales permanecen separadas en el inventario. Consulta [Fuentes y decisiones de contenido](docs/fuentes-y-datos.md).

## Repetir las pruebas

Para desarrollar y probar, instala las dependencias de desarrollo:

```sh
npm ci
npm test
```

Con la aplicación servida en `http://127.0.0.1:8765/app/` y Chrome instalado:

```sh
npm run test:e2e
```

Se verificaron **24 casos de datos/persistencia** y **55 comprobaciones en Google Chrome 157**, con perfiles aislados, recarga, cierre/reapertura, restauración y pantallas de 375, 768 y 1440 píxeles. Los resultados están en `evidencias/`. La suite no utiliza el perfil personal del navegador.

## Generar la entrega

Con Python 3 y Git disponibles, desde un árbol de trabajo limpio:

```sh
python scripts/package_project.py
```

Genera `entrega/devops-atlas-entrega.zip`, un manifiesto SHA-256 y el historial de commits. El ZIP contiene lo necesario para ejecutar y revisar el proyecto; no incluye dependencias instaladas, perfiles de pruebas ni credenciales.
