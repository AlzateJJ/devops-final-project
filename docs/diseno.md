# Diseño y alcance

Responsable: Juan José Alzate. Fuente de requisitos: `inventario/fuentes/supletorio.pdf`, página 1.

## Siete fases

1. Inventariar fuentes: 144 herramientas del alcance exigido, 14 prácticas, 19 diagramas únicos y 21 apariciones. Las otras 55 menciones permanecen en el inventario trazable.
2. Planificar: 42 tarjetas en `planificacion/trello-backlog.json`, creadas inicialmente en Backlog y trasladadas a Testing tras revisar la implementación en https://trello.com/b/5CSrY3pF/devops-tools-project.
3. Diseñar: modelo, esquema preconceptual y recorridos de usuario.
4. Implementar: navegación, registro y actualización de herramientas, prácticas y usos; almacenamiento local y respaldos.
5. Completar contenido: descripciones, logos, diagramas, usos y semilla JSON.
6. Verificar: integridad, seis recorridos, errores, persistencia, teclado y pantallas pequeñas.
7. Entregar: guía, evidencias, historial y ZIP reproducible. El envío a MinasLap lo realiza el estudiante.

## Contrato

Un objeto JSON versión 1 contiene `categories`, `prices`, `tools`, `practices`, `diagrams`, `usages`, `sources` y `meta`. Las entidades tienen el mismo contrato en `app/data/database.json`, localStorage y exportaciones. El respaldo portable añade `resources`, un mapa de rutas a archivos codificados como data URL. Las listas de categorías y modelos de precio son catálogos controlados.

- Herramienta: `id`, `name`, `description`, `logo`, `price`, `category`, `aliases`, `sourceCategory`, `sourcePrice`, `references`, `notes` y `logoSource`.
- Práctica: `id`, `name`, `description`, `image`, `diagramId`, `references`.
- Diagrama: `id`, `name`, `type`, `practiceId` opcional, `image`, `references`.
- Uso: `id`, `toolId`, `practiceId`, `description`.
- Fuente: `id`, `name`, `file`; cada referencia contiene fuente y página.

Los identificadores estables no dependen del nombre ni del símbolo de la tabla. No se admite duplicar una pareja herramienta/práctica. Las ediciones no cambian los IDs. La aplicación no necesita eliminación para satisfacer el enunciado. Las imágenes nuevas se guardan como PNG, JPEG o WebP embebidos con tamaño limitado; las imágenes iniciales usan rutas locales.

`localStorage` usa la clave `devops-atlas:v1` para los registros. Los recursos restaurados se guardan como un paquete en IndexedDB (`entrega-final-devops-resources`, almacén `bundles`), identificado por `meta.resourceBundle`. Ese identificador interno no se exporta. La vista resuelve las rutas a URL de Blob; al cerrar y reabrir se recuperan desde IndexedDB. Así los aproximadamente 22 MB del respaldo completo no tienen que caber en localStorage. Las imágenes PNG, JPEG, WebP y los PDF se incluyen sin alterar sus bytes; los logos SVG/ICO locales se convierten a PNG en la exportación.

Restaurar valida los registros, la cobertura exacta de recursos, rutas, tipos, encabezados de archivos y la decodificación de imágenes. Primero guarda el paquete nuevo; solo después reemplaza los registros. Si falla la escritura o cambia la base en otra pestaña, conserva el estado anterior y elimina el paquete temporal. Los JSON antiguos siguen siendo compatibles usando los archivos locales del proyecto.

Vaciar requiere confirmación. Elimina la clave de registros y los paquetes de recursos que existían al iniciar la operación, incluidos huérfanos de recuperaciones anteriores. Mantiene `devops-atlas:empty` como marcador sin datos del usuario: evita cargar otra vez la semilla y detecta cambios entre pestañas incluso cuando el catálogo está vacío. Solo se carga la semilla cuando no existe ni base ni marcador. No se usa `localStorage.clear()`. Si falla el borrado físico de recursos, se informa y el usuario puede reintentarlo. Categorías y modelos de precio permanecen como configuración de los formularios.

Un error de lectura, validación o escritura no autoriza reemplazar datos. Restaurar y vaciar exigen confirmación. Dos pestañas detectan cambios externos antes de guardar; las mutaciones quedan bloqueadas mientras se restaura o vacía el catálogo.

## Esquema preconceptual

El index presenta conceptos rectangulares, relaciones estructurales «tiene» con borde continuo y relaciones dinámicas con borde discontinuo. Las ramas se ordenan Herramienta → Uso ← Práctica: Uso ocupa el centro y recibe una flecha desde cada entidad, con la relación estructural «tiene». Cada acción Registrar/Actualizar enlaza a su interfaz. Las ramas de atributos muestran nombre, descripción, logo, precio y categoría para herramientas; herramienta, práctica y descripción cultural para usos; nombre, descripción y diagrama para prácticas. La misma referencia de concepto en distintas ramas se identifica por nombre.

La definición de Diagrama Essence, con su imagen y fuente, queda dentro de la rama Práctica. El contador «Diagramas en Prácticas» incluye los 14 diagramas asociados a prácticas y los 5 materiales de apoyo disponibles en esa sección. Se conservan los 19 diagramas sin presentar una sección de navegación independiente.

`app/js/schema.js` genera el esquema y ajusta las conexiones SVG a la posición de sus conceptos. Cuando el contenedor es estrecho, las ramas se apilan en el mismo orden y las flechas recorren los márgenes hasta Uso. La aplicación desconecta la observación de tamaño al abandonar la vista.

La notación sigue la descripción de [Zapata, Tamayo y Arango, sección 2.3](https://revistas.unal.edu.co/index.php/dyna/article/download/981/11652/25619?inline=1). El diagrama concreto es una elaboración para este proyecto.

## Recorridos

El esquema abre Registrar o Actualizar para cada entidad. Registrar abre un formulario vacío; Actualizar abre un catálogo con búsqueda y botones de edición. Los formularios tienen validaciones, previsualización de imagen cuando corresponde, confirmación de guardado y cancelación. Se puede consultar el catálogo sin editar. La página Prácticas reúne los diagramas de sus fichas y, al final, los cinco diagramas de apoyo Essence. La antigua dirección de la galería redirige a Prácticas.

## Decisiones de contenido

Se conserva el modelo de precio transcrito del curso; no es una cotización actual. Donde la fuente omite ese dato, el modelo se identifica como «No especificado en la fuente». No se interpreta como gratuito. Las fichas explican la función del producto; los nombres históricos se mantienen.

Vite y webpack aparecen bajo Containers en la lámina P06F:11. La aplicación los clasifica funcionalmente en Integración continua por su papel en la construcción, conserva `sourceCategory=CONT` y explica el cambio. Las restantes categorías conservan el criterio de la tabla del profesor.

No se requieren cuentas, integración con las 144 herramientas, servidor de datos ni despliegue comercial. El servidor HTTP local solo entrega archivos. Respaldos, búsqueda, filtros y guía son apoyos de implementación, no nuevos requisitos atribuidos al profesor.
