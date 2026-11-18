# Diseño y alcance

Responsable: Juan José Alzate. Fuente de requisitos: `inventario/fuentes/supletorio.pdf`, página 1.

## Siete fases

1. Inventariar fuentes: 144 herramientas del alcance exigido, 14 prácticas, 19 diagramas únicos y 21 apariciones. Las otras 55 menciones permanecen en el inventario trazable.
2. Planificar: 42 tarjetas en `planificacion/trello-backlog.json`, destinadas al Backlog de https://trello.com/b/5CSrY3pF/devops-tools-project.
3. Diseñar: modelo, esquema preconceptual y recorridos de usuario.
4. Implementar: navegación, registro y actualización de herramientas, prácticas y usos; almacenamiento local y respaldos.
5. Completar contenido: descripciones, logos, diagramas, usos y semilla JSON.
6. Verificar: integridad, seis recorridos, errores, persistencia, teclado y pantallas pequeñas.
7. Entregar: guía, evidencias, historial y ZIP reproducible. El envío a MinasLap lo realiza el estudiante.

## Contrato

Un objeto JSON versionado contiene `categories`, `prices`, `tools`, `practices`, `diagrams`, `usages`, `sources` y `meta`. Se usa exactamente esta estructura en `app/data/database.json`, localStorage y exportaciones. Las listas de categorías y modelos de precio son catálogos controlados.

- Herramienta: `id`, `name`, `description`, `logo`, `price`, `category`, `aliases`, `sourceCategory`, `sourcePrice`, `references`, `notes` y `logoSource`.
- Práctica: `id`, `name`, `description`, `image`, `diagramId`, `references`.
- Diagrama: `id`, `name`, `type`, `practiceId` opcional, `image`, `references`.
- Uso: `id`, `toolId`, `practiceId`, `description`.
- Fuente: `id`, `name`, `file`; cada referencia contiene fuente y página.

Los identificadores estables no dependen del nombre ni del símbolo de la tabla. No se admite duplicar una pareja herramienta/práctica. Las ediciones no cambian los IDs. La aplicación no necesita eliminación para satisfacer el enunciado. Las imágenes nuevas se guardan como PNG, JPEG o WebP embebidos con tamaño limitado; las imágenes iniciales usan rutas locales.

`localStorage` usa una clave exclusiva `devops-atlas:v1`. La inicialización solo ocurre cuando la clave no existe. Un error de lectura, validación o escritura no autoriza reemplazar datos. El respaldo completo permite traslado entre perfiles; restaurar exige confirmación y validación previa. Dos pestañas detectan cambios externos para impedir sobrescritura de una versión antigua.

## Esquema preconceptual

El index presenta conceptos rectangulares, relaciones estructurales «tiene» con borde continuo y relaciones dinámicas con borde discontinuo. Cada acción Registrar/Actualizar enlaza a su interfaz. Las ramas de atributos muestran nombre, descripción, logo, precio y categoría para herramientas; nombre, descripción y diagrama para prácticas; herramienta, práctica y descripción cultural para usos. La misma referencia de concepto en distintas ramas se identifica por nombre.

La notación sigue la descripción de [Zapata, Tamayo y Arango, sección 2.3](https://revistas.unal.edu.co/index.php/dyna/article/download/981/11652/25619?inline=1). El diagrama concreto es una elaboración para este proyecto.

## Recorridos

El esquema abre Registrar o Actualizar para cada entidad. Registrar abre un formulario vacío; Actualizar abre un catálogo con búsqueda y botones de edición. Los formularios tienen validaciones, previsualización de imagen cuando corresponde, confirmación de guardado y cancelación. Se puede consultar el catálogo sin editar. La galería Essence distingue prácticas y material de apoyo.

## Decisiones de contenido

Se conserva el modelo de precio transcrito del curso; no es una cotización actual. Donde la fuente omite ese dato, el modelo se identifica como «No especificado en la fuente». No se interpreta como gratuito. Las fichas explican la función del producto; los nombres históricos se mantienen.

Vite y webpack aparecen bajo Containers en la lámina P06F:11. La aplicación los clasifica funcionalmente en Integración continua por su papel en la construcción, conserva `sourceCategory=CONT` y explica el cambio. Las restantes categorías conservan el criterio de la tabla del profesor.

No se requieren cuentas, integración con las 144 herramientas, servidor de datos ni despliegue comercial. El servidor HTTP local solo entrega archivos. Respaldos, búsqueda, filtros y guía son apoyos de implementación, no nuevos requisitos atribuidos al profesor.
