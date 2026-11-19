# Matriz de requisitos y evidencias

Fuente: `inventario/fuentes/supletorio.pdf`, página 1. Responsable: Juan José Alzate.

| Requisito | Implementación | Evidencia |
|---|---|---|
| HTML5 y CSS | `index.html` generado y `app/styles.css`; HTML fuente en `app/index-desarrollo.html` dentro del ZIP | Apertura directa en Chrome y capturas de escritorio/móvil |
| Index como esquema preconceptual completo | `app/js/app.js` y `app/js/schema.js`: conceptos, atributos, seis relaciones dinámicas y Herramienta → Uso ← Práctica | Seis enlaces y sus destinos en Chrome; flechas conectadas a Uso entre 320 y 1920 px |
| Registrar/actualizar herramientas con logo, nombre, descripción, precio y categoría | `app/js/tools.js` | Registro y edición de herramienta con imagen cargada |
| Herramientas de los bloques exigidos | `app/data/database.json`, 144 herramientas | Test de igualdad exacta de IDs con el inventario |
| Registrar/actualizar prácticas con nombre, descripción e imagen | `app/js/practices.js` | Registro, edición y sincronización del diagrama |
| Incluir todos los diagramas Essence | 19 diagramas dentro de Prácticas: 14 en sus fichas y 5 de apoyo; 21 referencias de aparición | Tests de fuentes, cobertura de los 19 diagramas y ampliación de imágenes |
| Registrar/actualizar usos por práctica con descripción cultural | `app/js/usages.js`, 42 ejemplos iniciales | Registro/edición de uso e integridad de referencias |
| Simular base en almacenamiento interno de Chrome | `app/js/store.js`, clave `devops-atlas:v1` | Recarga y cierre/reapertura de Chrome con el mismo perfil |
| JSON semejante a estructura persistida | Mismo contrato de entidades; respaldo con recursos embebidos y archivos restaurados en IndexedDB | Exportación/restauración con igualdad de registros y archivos |
| Tarjetas de planificación/desarrollo | 42 tarjetas revisadas en el tablero indicado, lista Testing | `planificacion/trello-publicacion.json`: lectura de 42 títulos, descripciones y listas |
| Logos y recursos necesarios | `app/assets/`, `inventario/fuentes/` | Chrome decodifica 144 logos y 19 diagramas; validación de archivos |

## Apoyos añadidos

| Apoyo | Verificación |
|---|---|
| Búsqueda por alias y filtros | Azure DevOps recupera VSTS; categoría Testing contiene 23 herramientas |
| Respaldo completo y recuperación (utilidad adicional en Gestión de datos) | Un JSON con 171 recursos, incluidos ocho PDF; restauración con archivos originales bloqueados; persiste al reabrir Chrome |
| Vaciar información (solicitud adicional del responsable) | Confirmación explícita; borra registros y archivos propios; no recarga la semilla ni borra datos ajenos; permite volver a crear y restaurar |
| Guía para JSON propio (solicitud adicional del responsable) | Botón en Gestión de datos; plantilla y ejemplo importables; conversión local a Base64; importación de imágenes y PDF propios sin archivos originales; teclado y móvil |
| Validación | Nombres y pares duplicados, referencias inexistentes, imágenes no admitidas |
| Escritura segura | Error de cuota conserva estado; otra pestaña impide sobrescribir cambios nuevos |
| Texto seguro | Texto con HTML se muestra sin ejecutar código |
| Accesibilidad y tamaños | Enlace para saltar al contenido, diálogos con Escape, 375/768/1440 px sin desbordamiento |
| Apertura con doble clic (solicitud adicional del responsable) | ZIP completo: index.html y scripts preparados, sin Node.js ni servidor; misma suite funcional con conexión desactivada |

## Resultados

`evidencias/pruebas-datos.xml`: 39 casos aprobados. `evidencias/offline/` contiene las tres suites ejecutadas desde `file://` con conexión desactivada: 55 comprobaciones de recorridos generales, 19 de exportación/vaciado/restauración y 17 de la guía del JSON. Se verifica la restauración sin acceso a los archivos originales. Las pruebas utilizan perfiles aislados y un portapapeles simulado; no borran datos personales del navegador ni cambian el portapapeles del usuario. Los reportes de la versión HTTP permanecen en `evidencias/`.

Las verificaciones automatizadas comprueban cobertura, integridad y comportamiento. La ejecución del ZIP extraído por file:// se registra en `evidencias/entrega-limpia.json`, incluyendo apertura sin servidor, archivos íntegros, navegación e independencia de dos copias en carpetas distintas. Para PDF se comprueban los bytes exactos y el enlace a una nueva pestaña; [Playwright no permite comprobar visualmente su visor en modo headless](https://playwright.dev/docs/api/class-page#page-goto). No se ha realizado el envío a MinasLap.

`evidencias/esquema-relaciones.json` registra la revisión visual y geométrica del esquema en nueve anchos: Uso permanece entre las otras entidades, las dos flechas terminan en sus bordes y no hay desbordamiento horizontal. Los 19 diagramas se conservan dentro de Prácticas.
