# Guía de uso

## Inicio

Extrae **todo el ZIP**, entra en la carpeta `devops-atlas` y abre **`index.html`**, el que está junto a `LEEME.txt`, con doble clic en Google Chrome. No necesitas Node.js, instalaciones, comandos ni servidor. En Windows, `Iniciar.cmd` también abre ese archivo. Mantén las carpetas extraídas junto al HTML.

La primera visita carga el catálogo incorporado en la entrega, generado a partir de `app/data/database.json` e incluyendo sus logos, diagramas y PDF. Las visitas posteriores usan los datos de este perfil de Chrome y esta carpeta. No se reemplazan automáticamente por la semilla aunque cambie el archivo del proyecto. Después de Vaciar información, la aplicación sigue vacía al recargar.

Antes de mover o renombrar la carpeta, cambiar de equipo o usar otro perfil, descarga un respaldo JSON y restáuralo en la nueva ubicación. Dos copias de la entrega en carpetas diferentes conservan sus datos por separado. El catálogo funciona sin Internet; los enlaces a Trello y sitios externos sí requieren conexión.

## Seis recorridos

| Acción desde el esquema | Qué hacer |
|---|---|
| Herramienta → Registra | Introducir nombre, categoría, modelo de precio, descripción y logo; seleccionar Guardar |
| Herramienta → Actualiza | Buscar/filtrar la herramienta; abrir Editar; cambiar campos y guardar |
| Práctica → Registra | Introducir nombre, descripción e imagen Essence; guardar |
| Práctica → Actualiza | Buscar la práctica; abrir Editar; cambiar sus datos o imagen y guardar |
| Uso → Registra | Seleccionar herramienta y práctica; describir actividad y aporte a cultura DevOps; guardar |
| Uso → Actualiza | Filtrar relaciones, abrir Editar uso y modificar la descripción o las entidades |

Las seis acciones están disponibles desde el esquema inicial. También puedes usar la navegación lateral o superior. Cancelar deja intacta la base. El sistema conserva el ID de los registros editados para mantener sus relaciones.

El esquema coloca **Uso en el centro**, entre Herramienta y Práctica. Las dos flechas llegan a Uso para mostrar que relaciona una herramienta con una práctica. En pantallas estrechas, las ramas se apilan y conservan sus conexiones. **Diagrama Essence** sigue apareciendo dentro de Práctica, con Imagen y Fuente: es parte de su contenido. El contador «Diagramas en Prácticas» reúne los diagramas de las fichas y el material de apoyo de esa sección.

No se admiten nombres repetidos dentro del mismo tipo de entidad ni una pareja herramienta/práctica repetida. Para registrar otro ejemplo de la misma pareja, amplía su descripción existente. Los textos obligatorios no pueden quedar vacíos.

Los formularios aceptan imágenes PNG, JPEG o WebP de hasta 1 MB. La vista previa permite comprobar el archivo antes de guardar. Las imágenes cargadas se incorporan al respaldo. Los logos iniciales pueden estar en SVG porque forman parte de los recursos locales revisados; el formulario no admite SVG de usuario.

## Consultar contenido

En Herramientas puedes buscar por nombre, alias, descripción o ID y filtrar por categoría. La ficha muestra su función, las prácticas relacionadas, el modelo de precio registrado, la referencia histórica y sus fuentes.

En Prácticas puedes consultar su descripción, ampliar el diagrama y revisar usos concretos de herramientas. Cada una de las 14 prácticas incluye su diagrama. Al final de la misma página, «Material de apoyo Essence» reúne los otros 5 diagramas: proceso detallado de pruebas, alphas, espacios de actividad, competencias y notación. Así se conservan los 19 diagramas del curso sin una sección independiente en el menú. Escape cierra la ampliación.

Las relaciones de uso son ejemplos elaborados para explicar colaboración, automatización, retroalimentación y trazabilidad. No son integraciones que esta aplicación ejecute con los productos catalogados. Las prácticas académicas de conceptualización y certificación simulada conservan su sentido educativo.

## Gestión de datos: respaldar, restaurar y vaciar

Esta utilidad es un apoyo adicional, no un requisito del taller. Está disponible en el menú principal como «Gestión de datos», tanto al abrir el HTML directamente como en la versión de desarrollo mediante servidor.

1. Abre Gestión de datos y selecciona Descargar respaldo JSON.
2. Conserva ese único JSON: incluye registros, logos, diagramas e imágenes cargadas y los PDF de referencia. No necesitas una carpeta adicional de imágenes para restaurar los datos en la aplicación.
3. Para recuperar datos, selecciona el JSON en Restaurar desde JSON.
4. Comprueba las cantidades mostradas. La aplicación valida estructura, referencias e imágenes antes de permitir la restauración.
5. Marca la confirmación de reemplazo y selecciona Restaurar base de datos.

La restauración reemplaza la base completa de esta aplicación. Un archivo inválido no modifica los datos. Para regresar al catálogo inicial, restaura explícitamente `app/data/database.json`, después de guardar cualquier cambio que quieras conservar.

La tercera tarjeta, **Vaciar información**, permite comenzar con una plantilla vacía. Descarga primero un respaldo, marca la confirmación y pulsa Vaciar información. Se borran las herramientas, prácticas, diagramas, relaciones, fuentes y archivos guardados por esta aplicación en el navegador. Los datos de otros sitios o aplicaciones no se borran. Al recargar o volver a abrir Chrome, el catálogo sigue vacío: puedes registrar recursos propios o restaurar el JSON descargado. Las categorías y modelos de precio siguen disponibles como opciones de los formularios.

El respaldo del catálogo inicial pesa aproximadamente 22 MB. Se aceptan archivos de hasta 100 MB. Los respaldos nuevos contienen todos sus recursos. Al abrir el ZIP sin servidor, los JSON anteriores, incluido `app/data/database.json`, pueden recuperar los archivos conocidos del catálogo incorporado. Si un JSON propio usa otros archivos, debe incluirlos en `resources`. El JSON de respaldo contiene datos y recursos, no el código de la aplicación.

### Preparar un JSON propio

En la esquina superior de Gestión de datos, **Ver guía del JSON** abre la documentación sin perder el archivo seleccionado para restaurar. Se puede cerrar con Cerrar o Escape. Incluye los campos de cada colección, categorías y precios permitidos, vínculos entre IDs, nombres de archivos, límites y errores frecuentes.

- **Descargar plantilla vacía:** obtiene un JSON válido con las colecciones vacías y los catálogos de opciones completos. Conserva sus campos y añade tus registros.
- **Descargar ejemplo completo:** obtiene una herramienta, una práctica, un diagrama y una relación con imágenes de demostración incorporadas. Sustituye tanto los textos como las imágenes; estas imágenes solo ilustran el formato de importación.
- **Ayuda: convertir un archivo a Base64:** convierte un PNG, JPEG, WebP o PDF de hasta 26 MB, en el navegador y sin enviarlo a un servidor. Copia todo el resultado, incluido el prefijo `data:`, como valor del archivo en `resources`.

Para que un JSON propio funcione por sí solo, incluye en `resources` todos los archivos usados por sus registros, codificados en Base64. Sus claves coinciden con los valores de `logo`, `image` o `sources.file`; no necesitas crear esas carpetas en tu equipo. Los PDF son opcionales: si no usas fuentes, deja `sources: []` y omite `references` o déjalo vacío. La guía explica cómo añadirlos cuando sí los necesitas.

Importar reemplaza el catálogo completo, incluso las colecciones vacías; no combina los registros y no exige vaciar antes. Los fragmentos con marcadores `BASE64_COMPLETO_…` de la documentación son ilustrativos y se deben completar; las dos descargas sí son archivos válidos listos para editar o importar.

## Recuperación y límites

- **Base corrupta:** se muestra una pantalla de recuperación. Descarga los datos originales y restaura un respaldo válido. No se borra automáticamente la información dañada.
- **Almacenamiento sin espacio o bloqueado:** el guardado se rechaza y mantiene los datos anteriores. Exporta un respaldo, reduce el tamaño de imágenes o revisa los permisos de almacenamiento del sitio.
- **Otra pestaña modificó la base:** se avisa y se bloquea un guardado desde la versión anterior. Recarga antes de editar de nuevo. Copia aparte cualquier texto sin guardar que necesites conservar.
- **Datos distintos en otra carpeta o dirección:** la apertura directa separa datos por carpeta. La versión HTTP también distingue `localhost`, `127.0.0.1`, puertos y perfiles. Usa el respaldo para transportarlos.
- **Imágenes no disponibles al importar:** un respaldo nuevo debe incluir todos sus archivos y se rechaza si falta alguno. Un JSON anterior sin recursos puede reutilizar los archivos conocidos del catálogo incorporado; para otros archivos, abre la copia donde todavía estén disponibles y descarga un respaldo nuevo completo.
- **Vaciado incompleto de archivos:** si el navegador no permite eliminar los archivos guardados, se informa el fallo. Vuelve a Gestión de datos y repite Vaciar información para completar el borrado.
- **La aplicación no abre:** confirma que extrajiste todo el ZIP y abriste su `index.html` principal, junto a `LEEME.txt`. La entrega no requiere servidor. La copia del código fuente del repositorio se prepara con los pasos de desarrollo del README.

Los límites de almacenamiento los determina el navegador. Los formularios de herramientas y prácticas admiten imágenes de hasta 1 MB; los respaldos completos tienen los límites indicados en la guía del JSON. Muchas imágenes pueden agotar la cuota acumulada. La aplicación informa el fallo sin confirmar un guardado que no ocurrió.

## Para revisar el proyecto

La planificación publicada está en el [tablero de Trello](https://trello.com/b/5CSrY3pF/devops-tools-project). Las 42 tarjetas se revisaron y trasladaron de Backlog a Testing por solicitud del responsable. Incluyen evidencia actualizada e indicaciones de revisión. La descripción contiene «Responsable Principal: Juan José Alzate». El MCP utilizado no ofrece asignación nativa de miembros a tarjetas, por lo que no se simuló esa asignación. La tarjeta final acredita la preparación del paquete; el envío a MinasLap sigue pendiente del estudiante.

Las evidencias se encuentran en `evidencias/` y la matriz relaciona los requisitos con los archivos y pruebas. El historial Git conserva los 12 commits iniciales separados por etapas y los ajustes posteriores. La entrega a MinasLap se realiza con el ZIP final y el enlace al tablero; no se ha enviado automáticamente a la plataforma.
