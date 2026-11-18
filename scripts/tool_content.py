"""Síntesis funcional para el catálogo; nombres y precios históricos provienen del inventario."""
CONTENT = '''
H001|github.com|Aloja repositorios Git y permite revisar cambios mediante solicitudes de incorporación. Centraliza código, incidencias y conversaciones para que el equipo integre trabajo con trazabilidad.
H002|itrsgroup.com|Ofrece monitoreo y análisis operativo de sistemas y aplicaciones. Ayuda a reunir señales del entorno, identificar anomalías y coordinar la atención de problemas de servicio.
H003|subversion.apache.org|Sistema de control de versiones centralizado. Conserva el historial de archivos y directorios, administra revisiones y permite coordinar cambios sobre un repositorio compartido.
H004|flywaydb.org|Gestiona migraciones de bases de datos mediante cambios versionados. Registra qué migraciones se aplicaron y permite reproducir la evolución del esquema entre entornos.
H005|aws.amazon.com/codepipeline/|Orquesta etapas de entrega de software, como obtención del código, construcción, pruebas y despliegue. Conecta servicios para ejecutar un flujo de cambios reproducible.
H006|openwhisk.apache.org|Plataforma de funciones activadas por eventos. Ejecuta acciones sin que cada aplicación tenga que gestionar directamente servidores dedicados para procesar esos eventos.
H007|alibabacloud.com|Proveedor de servicios de nube, incluidos cómputo, almacenamiento, redes y bases de datos. Permite aprovisionar entornos para construir, probar y operar aplicaciones.
H008|cloudfoundry.org|Plataforma para desplegar y operar aplicaciones sobre infraestructura de nube. Automatiza tareas de ejecución y administración para facilitar la entrega del software.
H009|azure.microsoft.com|Plataforma de nube de Microsoft con servicios de cómputo, almacenamiento, redes y datos. Permite preparar y administrar la infraestructura que necesita una aplicación.
H010|elastic.co/logstash|Procesa flujos de eventos mediante entradas, filtros y salidas. Recopila, transforma y envía registros para centralizar el análisis operativo.
H011|gitlab.com|Plataforma de colaboración sobre repositorios Git que reúne revisión de cambios, incidencias y automatización de CI/CD. Mantiene conectados el código y su proceso de entrega.
H012|delphix.com|Automatiza la disponibilidad de datos para desarrollo y pruebas mediante capacidades como virtualización y enmascaramiento. Ayuda a trabajar con conjuntos de datos controlados.
H013|helm.sh|Gestor de paquetes para Kubernetes. Agrupa manifiestos y parámetros en charts para instalar, configurar y actualizar aplicaciones de forma repetible.
H014|plutora.com|Herramienta de gestión de entregas que organiza calendarios, dependencias y entornos. Da visibilidad al avance y a la coordinación de cambios entre equipos.
H015|cloud.google.com|Plataforma de nube con servicios de cómputo, datos, almacenamiento y redes. Ofrece recursos para ejecutar aplicaciones y automatizar la provisión de entornos.
H016|aws.amazon.com|Plataforma de nube con servicios de infraestructura y servicios administrados. Permite preparar entornos de desarrollo, pruebas y operación con recursos configurables.
H017|aws.amazon.com/lambda/|Ejecuta funciones en respuesta a eventos sin administrar servidores para cada función. Se usa para procesamiento, integraciones y automatización de tareas.
H018|fluentd.org|Recolecta y encamina registros desde diferentes orígenes. Unifica eventos en un flujo que puede enviarse a plataformas de almacenamiento, búsqueda o análisis.
H019|bmc.com|Herramienta de gestión de código, construcción y despliegue para mainframe. Facilita el seguimiento de versiones y la incorporación de aplicaciones mainframe a procesos DevOps.
H020|red-gate.com|Familia de herramientas para desarrollo y operaciones de bases de datos. Apoya tareas como comparación de esquemas, cambios versionados y automatización de entregas de datos.
H021|aws.amazon.com/codebuild/|Servicio de construcción que compila código, ejecuta pruebas y produce artefactos a partir de una configuración. Se integra como etapa de un pipeline.
H022|jenkins.io|Servidor de automatización que ejecuta tareas y pipelines de construcción, pruebas y entrega. Permite encadenar actividades e integrar otras herramientas mediante extensiones.
H023|opentext.com|Herramienta de automatización de pruebas funcionales de interfaces y servicios. Permite crear pruebas reutilizables para comprobar el comportamiento esperado de una aplicación.
H024|saucelabs.com|Plataforma para ejecutar pruebas de aplicaciones web y móviles en distintos navegadores y dispositivos. Centraliza sesiones, resultados y evidencias de ejecución.
H025|perfecto.io|Plataforma de pruebas para aplicaciones web y móviles. Proporciona entornos y dispositivos con los que ejecutar pruebas y analizar los resultados.
H026|soapui.org|Herramienta para probar servicios y API, especialmente SOAP y REST. Permite construir solicitudes, verificaciones y suites que validan el comportamiento de los servicios.
H027|cfengine.com|Automatiza la configuración de sistemas mediante políticas declarativas. Busca mantener los equipos en un estado definido y reducir diferencias entre entornos.
H028|puppet.com|Gestiona configuración de infraestructura mediante descripciones del estado deseado. Aplica y verifica políticas para mantener servidores y servicios consistentes.
H029|broadcom.com|Familia de automatización operativa y de despliegue. Coordina trabajos y dependencias para ejecutar procesos repetibles entre aplicaciones y entornos.
H030|github.com/elasticbox|Herramienta histórica de despliegue y gestión de aplicaciones mediante componentes reutilizables llamados boxes. Modela configuración y dependencias para aprovisionar aplicaciones en distintos entornos.
H031|aws.amazon.com/ecs/|Servicio de orquestación de contenedores de AWS. Programa y administra tareas y servicios para ejecutar aplicaciones empaquetadas en contenedores.
H032|broadcom.com|Herramienta de coordinación de entrega continua que conecta actividades, controles y automatizaciones de una liberación. Permite visualizar el avance del software entre etapas.
H033|github.com/OpenMake-Software|Familia de herramientas de automatización de construcción y entrega, asociada a Meister y DeployHub. Apoya procesos repetibles de preparación y despliegue del software.
H034|azure.microsoft.com/products/functions/|Ejecuta funciones activadas por eventos en Azure. Se utiliza para automatizaciones e integraciones sin administrar una aplicación de servidor completa para cada tarea.
H035|redhat.com/en/technologies/cloud-computing/openshift|Plataforma de aplicaciones basada en Kubernetes. Integra capacidades para construir, desplegar y operar cargas de trabajo en contenedores.
H036|splunk.com|Recopila, indexa y consulta datos de máquinas, como registros y eventos. Permite investigar incidentes, construir tableros y generar alertas operativas.
H037|perforce.com|Sistema de control de versiones para código y otros archivos del proyecto. Administra historial, permisos y colaboración sobre repositorios centralizados.
H038|liquibase.com|Nombre histórico de una plataforma de automatización de cambios de bases de datos. Apoya la revisión, trazabilidad y ejecución controlada de migraciones en procesos de entrega.
H039|learn.microsoft.com/azure/devops/|Visual Studio Team Services es el nombre histórico asociado a Azure DevOps. Reúne capacidades de planificación, repositorios, construcción y pruebas para coordinar la entrega de software.
H040|atlassian.com/software/bamboo|Servidor de integración y entrega continua. Organiza planes de construcción, pruebas y despliegue, y conserva resultados para revisar el estado de cada cambio.
H041|karma-runner.github.io|Ejecutor de pruebas JavaScript en navegadores. Inicia entornos de navegador y comunica los resultados de las pruebas para apoyar la retroalimentación del desarrollo.
H042|tricentis.com/products/automate-continuous-testing-tosca|Plataforma de automatización de pruebas basada en modelos. Permite definir y reutilizar pruebas funcionales para validar procesos de negocio y aplicaciones.
H043|jasmine.github.io|Framework de pruebas para JavaScript con sintaxis orientada al comportamiento. Organiza especificaciones y expectativas para verificar unidades de código.
H044|locust.io|Herramienta de pruebas de carga que describe usuarios y tareas mediante Python. Genera tráfico concurrente para observar rendimiento y comportamiento bajo demanda.
H045|rudder.io|Plataforma para administrar configuración y cumplimiento de sistemas. Aplica políticas y reporta diferencias entre el estado observado y el esperado.
H046|chef.io|Automatiza configuración de infraestructura mediante código. Describe recursos y reglas para instalar software y mantener sistemas en un estado reproducible.
H047|cloudbees.com|Nombre histórico de una familia de automatización de entrega. Apoya la orquestación de procesos de construcción, liberación y despliegue de aplicaciones.
H048|docs.digital.ai/deploy|Herramienta de automatización de despliegues basada en modelos de aplicaciones y entornos. Organiza dependencias y pasos necesarios para instalar versiones de software.
H049|cloud.google.com/kubernetes-engine|Servicio administrado de Kubernetes en Google Cloud. Proporciona clústeres para ejecutar y administrar aplicaciones en contenedores.
H050|rancher.com|Plataforma para administrar clústeres de Kubernetes. Centraliza tareas de acceso, configuración y operación de entornos de contenedores.
H051|spinnaker.io|Plataforma de entrega continua con pipelines y estrategias de despliegue. Permite coordinar la liberación de aplicaciones en distintos proveedores de infraestructura.
H052|ibm.com|Herramienta de planificación y coordinación de liberaciones. Organiza actividades, dependencias y participantes para gestionar entregas que involucran varios componentes.
H053|ibm.com/cloud|Plataforma de nube con servicios de infraestructura y servicios administrados. Proporciona recursos para alojar aplicaciones y datos en distintos entornos.
H054|sumologic.com|Plataforma de análisis de registros y señales operativas. Centraliza información para investigar problemas, visualizar tendencias y crear alertas.
H055|bitbucket.org|Servicio de alojamiento y colaboración para repositorios Git. Ofrece solicitudes de incorporación y revisión de código para coordinar cambios entre desarrolladores.
H056|dbmaestro.com|Plataforma de automatización de cambios de bases de datos. Integra control, validaciones y trazabilidad para llevar cambios entre entornos de forma gestionada.
H057|jetbrains.com/teamcity/|Servidor de integración continua que ejecuta construcciones y pruebas. Organiza configuraciones, agentes y resultados para controlar la calidad de los cambios.
H058|circleci.com|Plataforma de CI/CD que ejecuta trabajos definidos como código. Automatiza construcción, pruebas y entrega con flujos vinculados al repositorio.
H059|mochajs.org|Framework de pruebas JavaScript para Node.js y navegadores. Organiza suites y casos, incluida la verificación de operaciones asíncronas.
H060|jmeter.apache.org|Herramienta para pruebas de carga y rendimiento de servicios. Genera solicitudes y registra mediciones para analizar tiempos de respuesta y comportamiento.
H061|testng.org|Framework de pruebas para Java con anotaciones, agrupación y configuración de ejecuciones. Facilita organizar suites y reportar resultados automatizados.
H062|junit.org|Framework de pruebas para la plataforma Java. Permite expresar casos y aserciones que verifican el comportamiento del código de forma repetible.
H063|developer.hashicorp.com/terraform|Herramienta de infraestructura como código. Describe recursos declarativamente y calcula cambios para aprovisionar y mantener entornos mediante proveedores.
H064|ansible.com|Automatiza configuración, provisión y tareas operativas mediante playbooks. Ejecuta procedimientos repetibles para coordinar cambios sobre múltiples sistemas.
H065|gocd.org|Servidor de entrega continua que modela pipelines y dependencias entre etapas. Permite seguir el recorrido de un cambio hasta su entrega.
H066|octopus.com|Plataforma de automatización de despliegues y operaciones. Define procesos, variables y entornos para promover versiones de software con controles consistentes.
H067|codefresh.io|Plataforma de automatización de entrega orientada a aplicaciones en contenedores. Coordina pipelines y flujos de despliegue para entornos de Kubernetes.
H068|mesos.apache.org|Gestor de recursos de clúster que distribuye CPU, memoria y otros recursos entre aplicaciones. Permite compartir infraestructura entre distintos tipos de cargas de trabajo.
H069|azure.microsoft.com/products/kubernetes-service/|Servicio administrado de Kubernetes en Azure. Facilita la ejecución y operación de aplicaciones en contenedores sobre clústeres.
H070|docs.digital.ai/release|Herramienta de orquestación de liberaciones. Coordina tareas automáticas, aprobaciones y dependencias para dar seguimiento al proceso completo de entrega.
H071|openstack.org|Conjunto de proyectos para construir infraestructura de nube. Administra cómputo, almacenamiento y redes a través de servicios y API.
H072|moogsoft.com|Plataforma de análisis y correlación de eventos operativos. Agrupa señales relacionadas para reducir ruido y ayudar a investigar incidentes.
H073|jfrog.com/artifactory/|Repositorio de artefactos de software que almacena paquetes y binarios. Permite compartir versiones construidas y mantener trazabilidad de las dependencias utilizadas.
H074|sonatype.com/products/sonatype-nexus-repository|Gestor de repositorios de componentes y paquetes. Centraliza la distribución y el almacenamiento de artefactos usados por los procesos de construcción.
H075|cloudbees.com|Servicio de integración y entrega continua presentado en el curso como CodeShip. Automatiza la construcción, ejecución de pruebas y despliegue desde cambios del repositorio.
H076|travis-ci.com|Servicio de integración continua que ejecuta construcciones y pruebas a partir de una configuración en el repositorio. Comunica el resultado de cada ejecución al equipo.
H077|fitnesse.org|Herramienta de pruebas de aceptación con páginas colaborativas y tablas ejecutables. Conecta ejemplos de comportamiento esperado con verificaciones automatizadas.
H078|gatling.io|Herramienta de pruebas de carga que modela escenarios y usuarios concurrentes. Permite analizar el rendimiento de servicios mediante ejecuciones repetibles.
H079|selenium.dev|Conjunto de herramientas para automatizar navegadores. Ejecuta interacciones de usuario y verificaciones sobre aplicaciones web en distintos navegadores.
H080|cucumber.io|Herramienta para especificaciones ejecutables mediante escenarios en Gherkin. Conecta ejemplos acordados con el negocio con pasos automatizados de prueba.
H081|developer.hashicorp.com/packer|Automatiza la creación de imágenes de máquinas a partir de plantillas. Produce imágenes reproducibles para diferentes plataformas y entornos.
H082|saltproject.io|Sistema de automatización y gestión de configuración. Permite ejecutar tareas remotas y mantener recursos de infraestructura mediante estados declarados.
H083|ibm.com|Herramienta de automatización de despliegues conocida también como uDeploy. Modela componentes, versiones, procesos y entornos para instalar aplicaciones de forma controlada.
H084|aws.amazon.com/codedeploy/|Servicio que automatiza despliegues de aplicaciones en recursos compatibles de AWS y servidores. Coordina la instalación de revisiones y su seguimiento.
H085|kubernetes.io|Sistema de orquestación de contenedores. Declara y mantiene el estado de aplicaciones distribuidas, con mecanismos de programación, descubrimiento y actualización.
H086|github.com/rkt/rkt|Proyecto histórico de ejecución de contenedores, conocido como Rocket. Proporcionaba un entorno de ejecución de contenedores; se conserva en el catálogo por su presencia en el curso.
H087|docker.com|Conjunto de herramientas para construir imágenes y ejecutar aplicaciones en contenedores. Empaqueta código y dependencias para facilitar consistencia entre entornos.
H088|docker.com|Nombre histórico de una edición empresarial de la plataforma Docker. Integra capacidades para gestionar imágenes, ejecución y operación de aplicaciones en contenedores.
H089|iron.io|Plataforma de servicios para ejecutar trabajos y gestionar colas de mensajes. Desacopla tareas de procesamiento para aplicaciones distribuidas.
H090|prometheus.io|Sistema de monitoreo de métricas y alertas. Recopila series temporales y permite consultar indicadores para observar el comportamiento de servicios.
H091|dynatrace.com|Plataforma de observabilidad que reúne información de aplicaciones e infraestructura. Ayuda a analizar rendimiento, dependencias y problemas de servicio.
H092|newrelic.com|Plataforma de observabilidad para aplicaciones e infraestructura. Reúne telemetría y permite investigar rendimiento y errores de los sistemas.
H093|elastic.co/kibana|Interfaz de exploración y visualización de datos del ecosistema Elastic. Permite consultar información y construir tableros para análisis operativo.
H094|appdynamics.com|Plataforma de monitoreo del rendimiento de aplicaciones. Observa transacciones y dependencias para localizar problemas que afectan la experiencia de los usuarios.
H095|elastic.co/elasticsearch|Motor distribuido de búsqueda y análisis de datos. Indexa documentos y permite consultas utilizadas en búsqueda, análisis de registros y observabilidad.
H096|digital.ai|Herramienta histórica de analítica del proceso de entrega incluida como XL Impact. Se orienta a medir y visualizar información del ciclo de desarrollo y liberación.
H097|datadoghq.com|Plataforma de observabilidad que integra métricas, registros y trazas. Permite relacionar señales de aplicaciones e infraestructura para investigar problemas.
H098|zenoss.com|Plataforma de monitoreo de infraestructura y servicios. Reúne eventos e información del entorno para detectar incidencias y entender sus dependencias.
H099|nagios.org|Sistema de monitoreo que comprueba el estado de hosts y servicios. Genera alertas a partir de verificaciones configuradas para detectar fallos.
H100|zabbix.com|Plataforma de monitoreo de redes, servidores y aplicaciones. Recopila métricas, define condiciones de alerta y presenta información operativa en tableros.
H101|opentext.com|Analizador estático de seguridad de código de la familia Fortify. Identifica patrones de vulnerabilidad sin depender de ejecutar la aplicación completa.
H102|developer.hashicorp.com/vault|Gestiona secretos y acceso a credenciales. Centraliza su entrega y políticas de uso para evitar que se distribuyan manualmente dentro del código.
H103|sonarsource.com/products/sonarqube/|Analiza calidad y seguridad del código y reporta hallazgos. Puede integrarse al proceso de construcción para evaluar reglas y puertas de calidad.
H104|blackduck.com|Herramientas de análisis de componentes de software de terceros. Ayudan a conocer dependencias, vulnerabilidades y condiciones de licencia del software incorporado.
H105|conjur.org|Gestiona secretos para aplicaciones, infraestructura y automatizaciones. Aplica políticas de acceso para entregar credenciales a las cargas de trabajo autorizadas.
H106|servicenow.com|Plataforma de flujos de trabajo y gestión de servicios. Apoya la coordinación de incidentes, cambios y solicitudes entre equipos de tecnología.
H107|atlassian.com/software/opsgenie|Herramienta de gestión de alertas y guardias incluida en el curso. Coordina notificaciones, escalamiento y respuesta de los equipos ante incidentes.
H108|digital.ai|Nombre histórico de una familia de colaboración y planificación ágil. Apoya el seguimiento de trabajo, requisitos y entregas entre equipos de desarrollo.
H109|atlassian.com/software/jira|Herramienta de seguimiento de trabajo e incidencias. Organiza tareas, estados y prioridades para coordinar planificación y ejecución del equipo.
H110|trello.com|Herramienta visual de organización de trabajo mediante tableros, listas y tarjetas. Permite compartir tareas, criterios, responsables y evidencias de avance.
H111|broadcom.com|Herramienta de planificación ágil conocida también como Rally. Organiza trabajo y seguimiento de equipos para coordinar objetivos, iteraciones y entregas.
H112|atlassian.com|Herramienta histórica de comunicación de equipos presentada en el curso como Stride. Reunía conversaciones y coordinación de trabajo; se conserva como referencia académica.
H113|pagerduty.com|Plataforma de respuesta a incidentes que coordina alertas, guardias y escalamiento. Ayuda a movilizar a las personas responsables de atender un problema operativo.
H114|slack.com|Plataforma de comunicación por canales y mensajes. Centraliza conversaciones y notificaciones de herramientas para apoyar la colaboración del equipo.
H115|bmc.com|Familia histórica de gestión de servicios de TI conocida como Remedy. Organiza incidentes, solicitudes y cambios para coordinar el trabajo operativo.
H116|tripwire.com|Herramientas de supervisión de integridad y configuración de sistemas. Detectan cambios y ayudan a revisar el cumplimiento de políticas de seguridad.
H117|fastly.com|Nombre histórico de una plataforma de protección de aplicaciones web y API. Analiza tráfico para identificar y responder a ataques contra servicios.
H118|veracode.com|Plataforma de seguridad de aplicaciones que analiza software para detectar vulnerabilidades. Integra verificaciones de seguridad al ciclo de desarrollo.
H119|snort.org|Sistema de detección y prevención de intrusiones de red basado en reglas. Inspecciona tráfico y genera eventos ante patrones sospechosos.
H120|checkmarx.com|Herramienta de análisis estático de seguridad de aplicaciones. Examina el código para localizar vulnerabilidades y orientar su corrección durante el desarrollo.
H121|cypress.io|Herramienta de automatización de pruebas de aplicaciones web. Permite escribir pruebas y observar su ejecución para comprobar recorridos y componentes de interfaz.
H122|playwright.dev|Framework para automatizar navegadores y probar aplicaciones web. Permite definir recorridos, aserciones y evidencias de ejecución en distintos motores de navegador.
H123|learning.postman.com/docs/collections/using-newman-cli/command-line-integration-with-newman/|Ejecutor de colecciones Postman desde la línea de comandos. Permite incorporar pruebas de API a scripts y pipelines de integración continua.
H124|mabl.com|Plataforma de automatización de pruebas para aplicaciones. Facilita la creación y ejecución de verificaciones y el análisis de resultados en procesos de entrega.
H125|postman.com|Plataforma para trabajar con API mediante solicitudes, colecciones y pruebas. Ayuda a documentar y compartir verificaciones de los contratos entre servicios.
H126|jestjs.io|Framework de pruebas para JavaScript con aserciones, simulaciones y reportes. Permite verificar unidades y componentes del código de forma automatizada.
H127|testcafe.io|Framework de pruebas de extremo a extremo para aplicaciones web. Automatiza acciones de navegador y verificaciones de los recorridos del usuario.
H128|sentry.io|Plataforma de seguimiento de errores y rendimiento de aplicaciones. Reúne detalles de fallos para ayudar al equipo a reproducirlos, priorizarlos y corregirlos.
H129|bugsnag.com|Herramienta de monitoreo de errores de aplicaciones. Agrupa fallos y contexto de ejecución para facilitar su diagnóstico y priorización.
H130|aws.amazon.com/cloudwatch/|Servicio de monitoreo y observabilidad de AWS. Reúne métricas, registros y alarmas para observar recursos y aplicaciones.
H131|grafana.com|Plataforma de visualización y consulta de datos de observabilidad. Construye tableros a partir de fuentes de métricas, registros y otras señales.
H132|elastic.co/elastic-stack|Conjunto de herramientas que combina ingestión, búsqueda y visualización de datos; ELK hace referencia a Elasticsearch, Logstash y Kibana. Se registra como conjunto, además de sus componentes.
H133|npmjs.com|Gestor de paquetes y registro del ecosistema JavaScript. Resuelve dependencias y ejecuta scripts del proyecto para apoyar construcción y pruebas reproducibles.
H134|support.atlassian.com/bitbucket-cloud/docs/get-started-with-bitbucket-pipelines/|Servicio de CI/CD integrado en Bitbucket. Ejecuta pasos definidos en el repositorio para construir, probar y desplegar cambios.
H135|docs.github.com/actions|Sistema de automatización de flujos en GitHub. Ejecuta trabajos ante eventos del repositorio, como pruebas, construcción y preparación de entregas.
H136|docs.gitlab.com/ci/|Capacidad de GitLab para definir y ejecutar pipelines desde el repositorio. Usa trabajos y ejecutores para automatizar construcción, pruebas y despliegue.
H137|gradle.org|Herramienta de automatización de construcción basada en tareas. Administra dependencias y procesos de compilación, pruebas y empaquetado de proyectos.
H138|yarnpkg.com|Gestor de paquetes para proyectos JavaScript. Administra dependencias y scripts del proyecto para apoyar instalaciones y construcciones consistentes.
H139|maven.apache.org|Herramienta de construcción y gestión de proyectos, especialmente Java. Define dependencias y un ciclo de tareas para compilar, probar y empaquetar software.
H140|vite.dev|Herramienta de desarrollo y construcción de aplicaciones web. Proporciona un servidor de desarrollo y una construcción de recursos para producción; no es un contenedor.
H141|webpack.js.org|Empaquetador de módulos y recursos para aplicaciones web. Procesa dependencias y genera archivos de salida para distribución; no es un sistema de contenedores.
H142|juju.is|Herramienta de orquestación de aplicaciones mediante modelos y operadores llamados charms. Describe relaciones y tareas operativas para desplegar y administrar servicios.
H143|aws.amazon.com/cloudformation/|Servicio de infraestructura como código de AWS. Describe recursos en plantillas y los administra como conjuntos para reproducir y actualizar entornos.
H144|pulumi.com|Herramienta de infraestructura como código que utiliza lenguajes de programación. Define y administra recursos de nube manteniendo el estado de los despliegues.
'''
TOOLS = {parts[0]:{'officialURL':'https://'+parts[1], 'description':parts[2]} for line in CONTENT.strip().splitlines() if (parts:=line.split('|',2))}
