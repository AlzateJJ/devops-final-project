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

## Respaldar y restaurar

Esta utilidad es un apoyo adicional, no un requisito del taller. Por solicitud del responsable, no tiene una entrada en el menú principal. Para tareas de recuperación sigue disponible en la dirección `http://127.0.0.1:8765/app/#/backup`.

1. Abre esa dirección y selecciona Descargar respaldo JSON.
2. Conserva ese archivo junto con una copia completa del proyecto, que contiene las imágenes iniciales.
3. Para recuperar datos, selecciona el JSON en Restaurar desde JSON.
4. Comprueba las cantidades mostradas. La aplicación valida estructura, referencias e imágenes antes de permitir la restauración.
5. Marca la confirmación de reemplazo y selecciona Restaurar base de datos.

La restauración reemplaza la base completa de esta aplicación. Un archivo inválido no modifica los datos. Para regresar al catálogo inicial, restaura explícitamente `app/data/database.json`, después de guardar cualquier cambio que quieras conservar.

## Recuperación y límites

- **Base corrupta:** se muestra una pantalla de recuperación. Descarga los datos originales y restaura un respaldo válido. No se borra automáticamente la información dañada.
- **Almacenamiento sin espacio o bloqueado:** el guardado se rechaza y mantiene los datos anteriores. Exporta un respaldo, reduce el tamaño de imágenes o revisa los permisos de almacenamiento del sitio.
- **Otra pestaña modificó la base:** se avisa y se bloquea un guardado desde la versión anterior. Recarga antes de editar de nuevo. Copia aparte cualquier texto sin guardar que necesites conservar.
- **Datos distintos en otra dirección:** `localhost`, `127.0.0.1`, diferentes puertos y perfiles tienen almacenes separados. Usa el respaldo para transportarlos.
- **Imágenes no disponibles al importar:** conserva la estructura completa de carpetas del proyecto. Los recursos iniciales se referencian con rutas relativas.
- **Servidor detenido:** vuelve a iniciar el proyecto. No se necesita internet para usar el catálogo; los enlaces a Trello, sitios oficiales y documentación externa sí lo requieren.

Los límites de almacenamiento los determina el navegador. La validación impide guardar imágenes mayores de 1 MB individualmente, pero muchas imágenes pueden agotar la cuota acumulada. La aplicación informa el fallo sin confirmar un guardado que no ocurrió.

## Para revisar el proyecto

La planificación publicada está en el [tablero de Trello](https://trello.com/b/5CSrY3pF/devops-tools-project). Las 42 tarjetas se revisaron y trasladaron de Backlog a Testing por solicitud del responsable. Incluyen evidencia actualizada e indicaciones de revisión. La descripción contiene «Responsable Principal: Juan José Alzate». El MCP utilizado no ofrece asignación nativa de miembros a tarjetas, por lo que no se simuló esa asignación. La tarjeta final acredita la preparación del paquete; el envío a MinasLap sigue pendiente del estudiante.

Las evidencias se encuentran en `evidencias/` y la matriz relaciona los requisitos con los archivos y pruebas. El historial Git conserva los 12 commits iniciales separados por etapas y los ajustes posteriores. La entrega a MinasLap se realiza con el ZIP final y el enlace al tablero; no se ha enviado automáticamente a la plataforma.
