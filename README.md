# Entrega Final DevOps

Proyecto académico de Integración y Despliegue de Software. Responsable: Juan José Alzate.

Aplicación local HTML5, CSS y JavaScript con catálogo de herramientas, prácticas Essence y relaciones de uso. JSON y almacenamiento del navegador simulan la base de datos.

Incluye **144 herramientas**, **14 prácticas**, **19 diagramas Essence** y **42 relaciones de uso**. Permite registrar y actualizar los tres tipos de registros, buscar, filtrar, ampliar diagramas y gestionar los datos: descargar un JSON con registros, imágenes y PDF, restaurarlo o vaciar el catálogo para cargar recursos propios. El catálogo permanece vacío después de recargar hasta que el usuario agregue o restaure información.

## Abrir la aplicación

**Para el profesor: extraer el ZIP y abrir el HTML con doble clic.** Solo necesita Google Chrome. No necesita instalar Node.js, paquetes ni iniciar un servidor.

1. Descarga `devops-atlas-entrega.zip` y extrae todo su contenido.
2. Entra en la carpeta `devops-atlas`.
3. Abre **`index.html`**, el que está junto a `LEEME.txt`, con Google Chrome. En Windows también puedes ejecutar `Iniciar.cmd`, que abre ese HTML en el navegador predeterminado.

El catálogo, sus imágenes y los PDF funcionan sin Internet. Las consultas, registros, ediciones, guardado, respaldos, vaciado y restauración se ejecutan en el navegador. Los enlaces a Trello y sitios externos requieren conexión.

Si estás trabajando con el código fuente del repositorio, puedes generar la carpeta lista para abrir con `npm ci` y `npm run build:offline`; luego abre `entrega/navegador/index.html`. Node.js y las dependencias son herramientas de desarrollo y empaquetado, no requisitos para el profesor.

Para desarrollo mediante HTTP sigue disponible:

```sh
node scripts/serve.cjs
```

En ese modo, abre `http://127.0.0.1:8765/app/`. Ctrl+C detiene el servidor. El ZIP ya incluye JavaScript preparado para abrirse directamente: su `app/index.html` lleva al HTML principal. `app/index-desarrollo.html` conserva el HTML fuente modular para revisar o ejecutar mediante HTTP.

## Qué revisar

- [Guía de uso y recuperación](docs/guia.md).
- [Diseño y fases](docs/diseno.md).
- [Matriz de requisitos y evidencias](docs/matriz-requisitos.md).
- [Preparación de entrega](docs/entrega.md).
- [Planificación revisable](planificacion/backlog.html).
- [Tablero real de Trello](https://trello.com/b/5CSrY3pF/devops-tools-project): **42 tarjetas revisadas y verificadas en Testing**. Juan José Alzate aparece como responsable en cada descripción. La preparación está terminada; el envío académico sigue pendiente del estudiante.

El almacenamiento está ligado al perfil y al origen del navegador; en la entrega abierta como archivo también se separa por carpeta. Exporta un respaldo antes de mover o renombrar la carpeta, cambiar de equipo, borrar datos del navegador o usar otra dirección/puerto. No hay una base de datos remota ni sincronización entre equipos.

## Estructura

| Carpeta | Contenido |
|---|---|
| `index.html`, `LEEME.txt` | Entrada lista para doble clic e instrucciones del ZIP |
| `runtime/` | JavaScript y catálogo con archivos incorporados, generados para apertura sin servidor |
| `app/` | HTML, CSS, módulos JavaScript y recursos locales |
| `app/data/database.json` | Base inicial; contrato de registros compartido con localStorage y respaldos, que además incluyen los archivos |
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

Para probar la entrega directamente como archivo, con Chrome instalado:

```sh
npm run build:offline
npm run test:offline
```

Se verificaron **39 casos de datos/persistencia** y **91 comprobaciones en Google Chrome 157 sobre `file://` con la conexión desactivada**: 55 de los recorridos generales, 19 de gestión de datos y 17 de la guía para preparar un JSON propio. Incluyen recarga, cierre/reapertura, vaciado, restauración con los archivos originales bloqueados, conversión de imágenes y PDF, y pantallas de 375, 768 y 1440 píxeles. Los resultados están en `evidencias/offline/`. Las suites utilizan perfiles aislados, sin modificar el perfil personal ni el portapapeles del usuario. `npm run test:e2e` conserva el mismo recorrido para la versión servida en HTTP.

## Generar la entrega

Para generar el ZIP, el desarrollador necesita Node.js 20 o posterior, las dependencias de `npm ci`, Google Chrome, Python 3 y Git. Desde un árbol de trabajo limpio:

```sh
python scripts/package_project.py
```

Genera `entrega/devops-atlas-entrega.zip`, un manifiesto SHA-256 y el historial de commits. El empaquetador prepara los archivos de apertura directa automáticamente. El ZIP contiene lo necesario para ejecutar y revisar el proyecto; no incluye dependencias instaladas, perfiles de pruebas ni credenciales.
