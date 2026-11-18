# Fuentes y decisiones de contenido

## Alcance

La fuente de requisitos es `inventario/fuentes/supletorio.pdf`. El inventario revisó las ocho presentaciones, con 105 páginas en total. La interpretación conservadora incluye las 120 entradas de la tabla que aparece en los bloques exigidos y 24 herramientas adicionales. Las otras 51 menciones complementarias y 4 contextuales se mantienen en el inventario, sin aumentar artificialmente la base obligatoria.

Se conservan 14 prácticas nombradas y 19 diagramas Essence únicos. Hay 21 apariciones en las fuentes porque integración continua y monitoreo se repiten. Los diagramas de apoyo no se presentan como prácticas inventadas. Las imágenes originales se conservan y pueden ampliarse.

## Trazabilidad

Cada herramienta y práctica conserva identificadores y referencias por presentación/página. Los nombres originales, alias y categorías históricas están separados de la clasificación funcional utilizada en la interfaz. `inventario/inventario.html` permite consultar el trabajo de extracción y las fuentes PDF.

Las descripciones funcionales y los ejemplos de uso son síntesis redactadas para el proyecto. Los ejemplos de uso incluyen una indicación de procedencia en el JSON: no son transcripciones de las diapositivas ni integraciones ejecutadas con los productos.

El esquema preconceptual de la aplicación es una elaboración del proyecto. Su notación toma como referencia [Zapata, Tamayo y Arango, sección 2.3](https://revistas.unal.edu.co/index.php/dyna/article/download/981/11652/25619?inline=1): conceptos, relaciones estructurales y relaciones dinámicas.

## Precios y categorías

Los códigos OS, FR, FM, PA y EN de las 120 entradas de la tabla son datos históricos del curso. No se modificaron para reflejar ofertas comerciales actuales. La aplicación permite distinguir el precio registrado de la transcripción original.

Las 24 herramientas adicionales tienen una clasificación editorial basada en páginas de planes o repositorios oficiales consultados el 18 de noviembre de 2026. `priceVerification` conserva modelo, fuente, fecha y alcance. No se registran importes. Una edición de código abierto puede tener servicios de nube o soporte pagos; la ficha delimita a qué edición se refiere la clasificación.

Para AWS CloudFormation, FR se limita al uso sin cargo adicional con proveedores AWS::* y Alexa::*. No significa que los recursos creados o las extensiones sean gratuitos; la ficha enlaza [la explicación oficial](https://aws.amazon.com/cloudformation/pricing/).

Vite y webpack aparecen bajo Containers en P06F:11. Se clasifican funcionalmente en Integración continua como herramientas de construcción y se conserva `sourceCategory=CONT` con una nota visible. No se describen como motores de contenedores.

VSTS/Azure DevOps y uDeploy/UrbanCode Deploy se manejan mediante alias. Las herramientas y conjuntos, como ELK y sus componentes, mantienen sus diferencias. Los símbolos repetidos de la tabla no se usan como claves.

## Imágenes y marcas

Los logos disponibles en las diapositivas se extrajeron individualmente. Para otros productos se utilizaron marcas distribuidas por Simple Icons, imágenes de las organizaciones/proveedores o documentación de integración del proveedor. El origen concreto de cada archivo está en `app/data/logo-sources.json` y en la ficha.

Cuando se usa la marca del proveedor, se indica expresamente que puede diferir del logo histórico o no ser específica del producto. No se inventaron logos con iniciales. La marca de DBmaestro procede de la documentación de su [integración con UrbanCode](https://urbancode.github.io/IBM-UCx-PLUGIN-DOCS/UCD/dbmaestro/).

Los recursos se incluyen para identificación y revisión académica del proyecto. Las marcas y las presentaciones conservan sus autores y propietarios originales.
