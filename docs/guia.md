# Guía de uso

## Inicio

Extrae todo el ZIP antes de abrir la aplicación. En Windows ejecuta `Iniciar.cmd` desde la carpeta extraída. Requiere Node.js 20 o posterior. Si prefieres terminal, ejecuta `node scripts/serve.cjs` desde la raíz y abre `http://127.0.0.1:8765/app/` en Chrome. La aplicación no requiere `npm install` para funcionar.

La primera visita carga el catálogo desde `app/data/database.json`. Las visitas posteriores usan los datos de este perfil y origen. No se reemplazan automáticamente por la semilla aunque cambie el archivo del proyecto.

Si el puerto 8765 ya está ocupado, comprueba si dejaste abierto el servidor del proyecto. Puedes usar `node scripts/serve.cjs --port 8767`, pero esa dirección constituye una base local diferente. Exporta y restaura un respaldo para trasladar tus cambios entre puertos. Usa siempre la misma dirección para continuar con la misma base.

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

No se admiten nombres repetidos dentro del mismo tipo de entidad ni una pareja herramienta/práctica repetida. Para registrar otro ejemplo de la misma pareja, amplía su descripción existente. Los textos obligatorios no pueden quedar vacíos.

Los formularios aceptan imágenes PNG, JPEG o WebP de hasta 1 MB. La vista previa permite comprobar el archivo antes de guardar. Las imágenes cargadas se incorporan al respaldo. Los logos iniciales pueden estar en SVG porque forman parte de los recursos locales revisados; el formulario no admite SVG de usuario.

## Consultar contenido

En Herramientas puedes buscar por nombre, alias, descripción o ID y filtrar por categoría. La ficha muestra su función, las prácticas relacionadas, el modelo de precio registrado, la referencia histórica y sus fuentes.

En Prácticas puedes consultar su descripción, ampliar el diagrama y revisar usos concretos de herramientas. Cada una de las 14 prácticas incluye su diagrama. Al final de la misma página, «Material de apoyo Essence» reúne los otros 5 diagramas: proceso detallado de pruebas, alphas, espacios de actividad, competencias y notación. Así se conservan los 19 diagramas del curso sin una sección independiente en el menú. Escape cierra la ampliación.

Las relaciones de uso son ejemplos elaborados para explicar colaboración, automatización, retroalimentación y trazabilidad. No son integraciones que esta aplicación ejecute con los productos catalogados. Las prácticas académicas de conceptualización y certificación simulada conservan su sentido educativo.

## Gestión de datos: respaldar, restaurar y vaciar

Esta utilidad es un apoyo adicional, no un requisito del taller. Está disponible en el menú principal como «Gestión de datos» y en la dirección `http://127.0.0.1:8765/app/#/backup`.

1. Abre Gestión de datos y selecciona Descargar respaldo JSON.
2. Conserva ese único JSON: incluye registros, logos, diagramas e imágenes cargadas y los PDF de referencia. No necesitas una carpeta adicional de imágenes para restaurar los datos en la aplicación.
3. Para recuperar datos, selecciona el JSON en Restaurar desde JSON.
4. Comprueba las cantidades mostradas. La aplicación valida estructura, referencias e imágenes antes de permitir la restauración.
5. Marca la confirmación de reemplazo y selecciona Restaurar base de datos.

La restauración reemplaza la base completa de esta aplicación. Un archivo inválido no modifica los datos. Para regresar al catálogo inicial, restaura explícitamente `app/data/database.json`, después de guardar cualquier cambio que quieras conservar.

La tercera tarjeta, **Vaciar información**, permite comenzar con una plantilla vacía. Descarga primero un respaldo, marca la confirmación y pulsa Vaciar información. Se borran las herramientas, prácticas, diagramas, relaciones, fuentes y archivos guardados por esta aplicación en el navegador. Los datos de otros sitios o aplicaciones no se borran. Al recargar o volver a abrir Chrome, el catálogo sigue vacío: puedes registrar recursos propios o restaurar el JSON descargado. Las categorías y modelos de precio siguen disponibles como opciones de los formularios.

El respaldo del catálogo inicial pesa aproximadamente 22 MB. Se aceptan archivos de hasta 100 MB. Los respaldos nuevos contienen todos sus recursos; los anteriores, incluido `app/data/database.json`, siguen siendo compatibles pero dependen de los archivos originales del proyecto. El JSON de respaldo contiene datos y recursos, no el código de la aplicación.

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
- **Datos distintos en otra dirección:** `localhost`, `127.0.0.1`, diferentes puertos y perfiles tienen almacenes separados. Usa el respaldo para transportarlos.
- **Imágenes no disponibles al importar:** un respaldo nuevo debe incluir todos sus archivos y se rechaza si falta alguno. Si usas un JSON anterior sin recursos embebidos, necesitas la copia original del proyecto para cargar sus imágenes. Ábrelo allí y descarga un respaldo nuevo completo.
- **Vaciado incompleto de archivos:** si el navegador no permite eliminar los archivos guardados, se informa el fallo. Vuelve a Gestión de datos y repite Vaciar información para completar el borrado.
- **Servidor detenido:** vuelve a iniciar el proyecto. No se necesita internet para usar el catálogo; los enlaces a Trello, sitios oficiales y documentación externa sí lo requieren.

Los límites de almacenamiento los determina el navegador. Los formularios de herramientas y prácticas admiten imágenes de hasta 1 MB; los respaldos completos tienen los límites indicados en la guía del JSON. Muchas imágenes pueden agotar la cuota acumulada. La aplicación informa el fallo sin confirmar un guardado que no ocurrió.

## Para revisar el proyecto

La planificación publicada está en el [tablero de Trello](https://trello.com/b/5CSrY3pF/devops-tools-project). Las 42 tarjetas se revisaron y trasladaron de Backlog a Testing por solicitud del responsable. Incluyen evidencia actualizada e indicaciones de revisión. La descripción contiene «Responsable Principal: Juan José Alzate». El MCP utilizado no ofrece asignación nativa de miembros a tarjetas, por lo que no se simuló esa asignación. La tarjeta final acredita la preparación del paquete; el envío a MinasLap sigue pendiente del estudiante.

Las evidencias se encuentran en `evidencias/` y la matriz relaciona los requisitos con los archivos y pruebas. El historial Git conserva los 12 commits iniciales separados por etapas y los ajustes posteriores. La entrega a MinasLap se realiza con el ZIP final y el enlace al tablero; no se ha enviado automáticamente a la plataforma.
