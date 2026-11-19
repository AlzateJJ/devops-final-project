# Matriz de requisitos y evidencias

Fuente: `inventario/fuentes/supletorio.pdf`, página 1. Responsable: Juan José Alzate.

| Requisito | Implementación | Evidencia |
|---|---|---|
| HTML5 y CSS | `app/index.html`, `app/styles.css` | Inicio y capturas de escritorio/móvil |
| Index como esquema preconceptual completo | `app/js/app.js`, conceptos, atributos y seis relaciones dinámicas | Prueba de seis enlaces y sus destinos en Chrome |
| Registrar/actualizar herramientas con logo, nombre, descripción, precio y categoría | `app/js/tools.js` | Registro y edición de herramienta con imagen cargada |
| Herramientas de los bloques exigidos | `app/data/database.json`, 144 herramientas | Test de igualdad exacta de IDs con el inventario |
| Registrar/actualizar prácticas con nombre, descripción e imagen | `app/js/practices.js` | Registro, edición y sincronización del diagrama |
| Incluir todos los diagramas Essence | 19 diagramas dentro de Prácticas: 14 en sus fichas y 5 de apoyo; 21 referencias de aparición | Tests de fuentes, cobertura de los 19 diagramas y ampliación de imágenes |
| Registrar/actualizar usos por práctica con descripción cultural | `app/js/usages.js`, 42 ejemplos iniciales | Registro/edición de uso e integridad de referencias |
| Simular base en almacenamiento interno de Chrome | `app/js/store.js`, clave `devops-atlas:v1` | Recarga y cierre/reapertura de Chrome con el mismo perfil |
| JSON semejante a estructura persistida | Mismo contrato en semilla, localStorage y respaldo | Exportación/restauración con igualdad de datos |
| Tarjetas de planificación/desarrollo | 42 tarjetas revisadas en el tablero indicado, lista Testing | `planificacion/trello-publicacion.json`: lectura de 42 títulos, descripciones y listas |
| Logos y recursos necesarios | `app/assets/`, `inventario/fuentes/` | Chrome decodifica 144 logos y 19 diagramas; validación de archivos |

## Apoyos añadidos

| Apoyo | Verificación |
|---|---|
| Búsqueda por alias y filtros | Azure DevOps recupera VSTS; categoría Testing contiene 23 herramientas |
| Respaldo y recuperación (utilidad adicional sin entrada en el menú) | Archivo inválido conserva datos; confirmación explícita; recuperación de corrupción |
| Validación | Nombres y pares duplicados, referencias inexistentes, imágenes no admitidas |
| Escritura segura | Error de cuota conserva estado; otra pestaña impide sobrescribir cambios nuevos |
| Texto seguro | Texto con HTML se muestra sin ejecutar código |
| Accesibilidad y tamaños | Enlace para saltar al contenido, diálogos con Escape, 375/768/1440 px sin desbordamiento |
| Ejecución reproducible | Servidor de archivos local sin dependencias de ejecución ni base remota |

## Resultados

`evidencias/pruebas-datos.xml`: 24 casos aprobados. `evidencias/pruebas-navegador.json`: 55 comprobaciones aprobadas en Google Chrome 157.0.8103.79. Las pruebas utilizan perfiles aislados; no borran datos personales del navegador.

Las verificaciones automatizadas comprueban cobertura, integridad y comportamiento. La ejecución desde el ZIP extraído se registra en `evidencias/entrega-limpia.json`. No se ha realizado el envío a MinasLap.
