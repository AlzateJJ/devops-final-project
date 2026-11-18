from pathlib import Path
import collections
import hashlib
import html
import json
import re
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'inventario'
MANIFEST = json.loads((ROOT / 'tmp/inventario/fuentes-extraidas.json').read_text(encoding='utf-8'))
SOURCES = [{k: v for k, v in s.items() if k != 'paginas'} for s in MANIFEST]
SOURCE_LOOKUP = {s['id']: s for s in SOURCES}

def ref(source, page, kind='mencion_directa', label=None):
    d = {'fuente': source, 'pagina': page, 'tipo': kind}
    if label:
        d['rotulo'] = label
    return d

CATEGORIES = {
 'SCM': ('Source Control Management', 'Gestión del código fuente'),
 'DB': ('Database Automation', 'Automatización de bases de datos'),
 'CI': ('Continuous Integration', 'Integración continua'),
 'TEST': ('Testing', 'Pruebas'),
 'CONFIG': ('Configuration', 'Configuración'),
 'DEPLOY': ('Deployment', 'Despliegue'),
 'CONT': ('Containers', 'Contenedores'),
 'RELEASE': ('Release Orchestration', 'Orquestación de entregas'),
 'CLOUD': ('Cloud', 'Nube'),
 'AIOPS': ('AIOps', 'AIOps'),
 'ANALYTICS': ('Analytics', 'Analítica'),
 'MONITOR': ('Monitoring', 'Monitoreo'),
 'SEC': ('Security', 'Seguridad'),
 'COLLAB': ('Collaboration', 'Colaboración'),
}
PRICES = {'OS':'Open Source','FR':'Free','FM':'Freemium','PA':'Paid','EN':'Enterprise'}
BASE = '''
1|Gh|GitHub|FM|SCM
2|It|ITRS|EN|AIOPS
3|Sv|Subversion|OS|SCM
4|Fw|Flyway|OS|DB
5|Cp|AWS CodePipeline|PA|RELEASE
6|Aw|Apache OpenWhisk|OS|CLOUD
7|Al|Alibaba Cloud|PA|CLOUD
8|Cy|Cloud Foundry|OS|CLOUD
9|Az|Microsoft Azure|PA|CLOUD
10|Ls|Logstash|OS|AIOPS
11|Gl|GitLab|OS|SCM
12|Dp|Delphix|EN|DB
13|Hm|Helm|OS|CONT
14|Pr|Plutora Release|EN|RELEASE
15|Gc|Google Cloud|EN|CLOUD
16|As|Amazon Web Services (AWS)|FM|CLOUD
17|Ld|AWS Lambda|PA|CLOUD
18|Fd|Fluentd|OS|AIOPS
19|Cw|Compuware ISPW|EN|SCM
20|Rg|Redgate|PA|DB
21|Cb|AWS CodeBuild|PA|CI
22|Jn|Jenkins|OS|CI
23|Mf|Micro Focus UFT|EN|TEST
24|SL|Sauce Labs|PA|TEST
25|Pe|Perfecto|PA|TEST
26|Su|SoapUI|FM|TEST
27|Ce|CFEngine|OS|CONFIG
28|Pu|Puppet|EN|CONFIG
29|Ca|CA Automic|EN|DEPLOY
30|Eb|ElasticBox|EN|DEPLOY
31|Ae|AWS ECS|PA|CONT
32|Cc|CA Continuous Delivery Director|OS|RELEASE
33|Om|OpenMake|FM|RELEASE
34|Af|Azure Functions|PA|CLOUD
35|Op|OpenShift|EN|CLOUD
36|Sp|Splunk|FM|AIOPS
37|Pf|Perforce HelixCore|EN|SCM
38|Dt|Datical|EN|DB
39|Vs|VSTS|FM|CI
40|Ba|Bamboo|PA|CI
41|Ka|Karma|FR|TEST
42|Tt|Tricentis Tosca|FM|TEST
43|Ja|Jasmine|OS|TEST
44|Lo|Locust.io|OS|TEST
45|Ru|Rudder|OS|CONFIG
46|Ch|Chef|EN|CONFIG
47|Ec|ElectricCloud|EN|DEPLOY
48|Xld|XebiaLabs XL Deploy|EN|DEPLOY
49|Gke|Google Kubernetes Engine (GKE)|PA|CONT
50|Ra|Rancher|OS|CONT
51|Sp|Spinnaker|OS|RELEASE
52|Ur|UrbanCode Release|EN|RELEASE
53|Ic|IBM Cloud|EN|CLOUD
54|Sl|Sumo Logic|FM|AIOPS
55|Bb|Bitbucket|FM|SCM
56|Db|DBmaestro|EN|DB
57|Tc|TeamCity|FM|CI
58|Cr|CircleCI|FM|CI
59|Mc|Mocha|OS|TEST
60|Jm|JMeter|FR|TEST
61|Tn|TestNG|FR|TEST
62|Ju|JUnit|FR|TEST
63|Tf|Terraform|FR|CONFIG
64|An|Ansible|OS|CONFIG
65|Go|GoCD|OS|DEPLOY
66|Oc|Octopus Deploy|EN|DEPLOY
67|Cf|Codefresh|FM|CONT
68|Ms|Mesos|OS|CONT
69|Aks|Azure Kubernetes Service (AKS)|PA|CONT
70|Xlr|XebiaLabs XL Release|EN|RELEASE
71|Os|OpenStack|OS|CLOUD
72|Mg|Moogsoft|PA|AIOPS
73|At|JFrog Artifactory|OS|SCM
74|Nx|Sonatype Nexus|OS|SCM
75|Cs|CodeShip|FM|CI
76|Tr|Travis CI|OS|CI
77|Fn|FitNesse|OS|TEST
78|Ga|Gatling|OS|TEST
79|Se|Selenium|FR|TEST
80|Cu|Cucumber|FM|TEST
81|Pa|Packer|OS|CONFIG
82|SL|Salt / SaltStack|OS|CONFIG
83|Ud|UrbanCode Deploy|EN|DEPLOY
84|Cd|AWS CodeDeploy|FM|DEPLOY
85|Ku|Kubernetes|OS|CONT
86|Rk|rkt (Rocket)|OS|CONT
87|Dk|Docker|OS|CONT
88|De|Docker Enterprise|EN|CONT
89|Ir|Iron.io|PA|CLOUD
90|Ps|Prometheus|OS|AIOPS
91|Dt|Dynatrace|FM|ANALYTICS
92|Nr|New Relic|FM|ANALYTICS
93|Ki|Kibana|OS|ANALYTICS
94|Ad|AppDynamics|FM|ANALYTICS
95|El|Elasticsearch|EN|ANALYTICS
96|Xli|XebiaLabs XL Impact|EN|ANALYTICS
97|Dd|Datadog|FM|ANALYTICS
98|Zn|Zenoss|EN|MONITOR
99|Ni|Nagios|OS|MONITOR
100|Zb|Zabbix|OS|MONITOR
101|Ff|Fortify SCA|EN|SEC
102|Hv|HashiCorp Vault|OS|SEC
103|Sr|SonarQube|OS|SEC
104|Bd|Black Duck|EN|SEC
105|Ck|CyberArk Conjur|EN|SEC
106|Sw|ServiceNow|EN|COLLAB
107|Og|OpsGenie|PA|COLLAB
108|Cn|CollabNet VersionOne|EN|COLLAB
109|Jr|Jira|PA|COLLAB
110|TL|Trello|FM|COLLAB
111|Ac|CA Agile Central|EN|COLLAB
112|St|Stride|FM|COLLAB
113|Pd|PagerDuty|PA|COLLAB
114|SL|Slack|FM|COLLAB
115|Ry|BMC Remedy|EN|COLLAB
116|Tw|Tripwire|OS|SEC
117|Sg|Signal Sciences|EN|SEC
118|Vc|Veracode|EN|SEC
119|Sn|Snort|OS|SEC
120|Cx|Checkmarx SAST|EN|SEC
'''

TOOLS = []
TABLE_REFS = [ref('P02',8,'tabla_completa'),ref('P03',17,'tabla_completa'),ref('P05',10,'tabla_completa'),ref('P06I',6,'tabla_completa')]
for line in BASE.strip().splitlines():
    num, symbol, name, price, category = line.split('|')
    TOOLS.append({'id':f'H{int(num):03}', 'nombre':name, 'alias':[], 'alcance':'base_tabla',
                  'numero_tabla':int(num), 'simbolo_tabla':symbol,
                  'categoria_curso':category, 'categoria_estado':'explicita_tabla',
                  'precio_curso':price, 'precio_actual':None,
                  'referencias':[dict(r) for r in TABLE_REFS], 'notas':[],
                  'descripcion':None, 'logo_archivo':None, 'logo_referencias':[]})
BY_ID = {t['id']:t for t in TOOLS}

def ids(nums):
    return [f'H{n:03}' for n in nums]

def mention(tool_ids, source, page, kind='lamina_categoria', logo=False):
    for tid in tool_ids:
        t = BY_ID[tid]
        r = ref(source,page,kind)
        if r not in t['referencias']:
            t['referencias'].append(r)
        if logo and r not in t['logo_referencias']:
            t['logo_referencias'].append(r)

mention(ids([106,107,108,109,110,111,112,113,114,115]),'P02',9,logo=True)
mention(ids([1,3,11,19,37,55,73,74]),'P03',18,logo=True)
mention(ids([23,24,25,26,41,42,43,44,59,60,61,62,77,78,79,80]),'P05',11,logo=True)
mention(ids([98,99,100]),'P06I',7,logo=True)
mention(ids([2,10,18,36,54,72,90]),'P06I',9,logo=True)
mention(ids([91,92,93,94,95,96,97]),'P06I',10,logo=True)
mention(ids([10,93,95]),'P06I',11,'componente_stack',logo=True)
mention(ids([6,7,8,9,15,16,17,34,35,53,71,89]),'P06F',3,logo=True)
mention(ids([21,22,39,40,57,58,75,76]),'P06F',7,logo=True)
mention(ids([13,31,49,50,67,68,69,85,86,87,88]),'P06F',10,logo=True)
mention(ids([27,28,45,46,63,64,81,82]),'P06F',14,logo=True)
mention(ids([63,64,46,28]),'P06F',13,'ilustracion_iac',logo=True)
mention(ids([73,83]),'P06F',13,'logos_adicionales',logo=True)
mention(ids([73,83]),'P06F',15,'logos_adicionales',logo=True)
mention(ids([16,63,22,1,87,85,31,91,36,90]),'P01',7,'oferta_laboral')
mention(ids([87]),'P06F',9,'explicacion_textual')

EXTRAS = '''
Cypress|TEST|P05:12|adicional_requerida
Playwright|TEST|P05:12|adicional_requerida
Newman|TEST|P05:12|adicional_requerida
mabl|TEST|P05:12|adicional_requerida
Postman|TEST|P05:12|adicional_requerida
Jest|TEST|P05:12|adicional_requerida
TestCafe|TEST|P05:12|adicional_requerida
Sentry|MONITOR|P06I:8,P01:14|adicional_requerida
Bugsnag|MONITOR|P06I:8,P01:14|adicional_requerida
Amazon CloudWatch|ANALYTICS|P06I:11,P01:7|adicional_requerida
Grafana|ANALYTICS|P06I:11,P01:7|adicional_requerida
Elastic Stack (ELK)|ANALYTICS|P06I:11|adicional_requerida
npm|CI|P06F:5,P06F:8,P01:14|adicional_requerida
Bitbucket Pipelines|CI|P06F:8|adicional_requerida
GitHub Actions|CI|P06F:8,P03:15,P01:7|adicional_requerida
GitLab CI/CD|CI|P06F:8,P01:7|adicional_requerida
Gradle|CI|P06F:8|adicional_requerida
Yarn|CI|P06F:8|adicional_requerida
Maven|CI|P06F:8|adicional_requerida
Vite|CONT|P06F:11|adicional_requerida
webpack|CONT|P06F:11|adicional_requerida
Juju|CONFIG|P06F:13,P06F:15|adicional_requerida
AWS CloudFormation|CONFIG|P06F:13,P06F:15,P01:7|adicional_requerida
Pulumi|CONFIG|P06F:15|adicional_requerida
AWS CDK||P01:7|complementaria
Azure DevOps||P01:7|complementaria
Git||P01:7,P01:14|complementaria
Amazon EKS||P01:7|complementaria
Python||P01:7|complementaria
Bash||P01:7|complementaria
PowerShell||P01:7|complementaria
draw.io||P01:14|complementaria
Asana||P01:14|complementaria
Pivotal Tracker||P01:14|complementaria
Box||P01:14|complementaria
Lucidchart||P01:14|complementaria
Flowdock||P01:14|complementaria
Google Drive||P01:14|complementaria
Google Docs||P01:14|complementaria
Planio||P01:14|complementaria
Wrike||P01:14|complementaria
Microsoft Office||P01:14|complementaria
Smartsheet||P01:14|complementaria
Gliffy||P01:14|complementaria
Basecamp||P01:14|complementaria
Dropbox||P01:14|complementaria
ZoomInfo||P01:14|complementaria
xMatters||P01:14|complementaria
Code Climate||P01:14|complementaria
Team Foundation Server||P01:14|complementaria
Node.js||P01:14|complementaria
Intercom||P01:14|complementaria
Runnable||P01:14|complementaria
Zoho CRM||P01:14|complementaria
Zephyr||P01:14|complementaria
Freshdesk||P01:14|complementaria
BrowserStack||P01:14|complementaria
QMetry||P01:14|complementaria
Salesforce||P06I:12,P01:14|contextual
Zendesk||P01:14|complementaria
TestFairy||P01:14|complementaria
Microsoft Teams||P01:14|complementaria
Instabug||P01:14|complementaria
Omnidesk||P01:14|complementaria
Snyk||P01:14|complementaria
Loggly||P01:14|complementaria
Raygun||P01:14|complementaria
BigPanda||P01:14|complementaria
Rollbar||P01:14|complementaria
SourceClear||P01:14|complementaria
Shippable||P01:14|complementaria
Buddybuild||P01:14|complementaria
Split||P01:14|complementaria
Heroku||P01:14|complementaria
Rackspace||P01:14|complementaria
VictorOps||P01:14|complementaria
BlueJeans||P01:14|complementaria
Mailjet||P06F:2|contextual
Shopify||P06F:2|contextual
Force.com||P06F:2|contextual
'''
for n,line in enumerate(EXTRAS.strip().splitlines(),121):
    name, cat, locations, scope = line.split('|')
    references = []
    logos = []
    for location in locations.split(','):
        sid,p = location.split(':'); p=int(p)
        kind = 'oferta_laboral' if sid=='P01' and p==7 else 'ilustracion_contextual' if scope=='contextual' else 'lamina_adicional'
        references.append(ref(sid,p,kind))
        if kind != 'oferta_laboral' and not (sid=='P06I' and p==12): logos.append(ref(sid,p,kind))
    t={'id':f'H{n:03}', 'nombre':name, 'alias':[], 'alcance':scope,'numero_tabla':None,'simbolo_tabla':None,
       'categoria_curso':cat or None, 'categoria_estado':'explicita_encabezado' if cat else 'no_especificada',
       'precio_curso':None,'precio_actual':None,'referencias':references,'notas':[],
       'descripcion':None,'logo_archivo':None,'logo_referencias':logos}
    TOOLS.append(t); BY_ID[t['id']]=t

BY_NAME={t['nombre']:t for t in TOOLS}
INFOGRAPHIC_BASE=[1,3,9,11,15,16,22,24,28,36,43,46,48,57,58,59,64,70,75,76,77,79,80,85,87,91,92,94,97,99,100,106,107,110,113,114]
mention(ids(INFOGRAPHIC_BASE),'P01',14,'infografia_general',logo=True)
mention(ids([16,9]),'P06F',2,'ilustracion_contextual',logo=True)

ALIASES={1:['Github'],3:['SubVersion','Apache Subversion'],9:['Azure','Microsoft Azure'],11:['Gitlab'],
 14:['Release','Pr'],15:['Google Cloud Platform','Google Cld'],16:['AWS','Amazon'],17:['Lambda'],
 19:['ISPW'],21:['CodeBuild','Code Build'],23:['Microfocus','MicroFocus UFT'],29:['CA Automic'],30:['ElecBox'],
 31:['ECS'],32:['Director','CA CD Director'],33:['Open Make'],37:['HelixCore'],39:['Visual Studio Team Services'],
 42:['Tosca'],44:['Locust'],47:['ElecCloud'],48:['XL Deploy'],49:['GKE'],52:['Urelease'],
 55:['BitBucket'],60:['Apache JMeter'],69:['AKS'],70:['XL Release'],73:['Artifactory'],74:['Nexus'],
 75:['Codeship'],82:['Salt','SaltStack'],83:['Urban CD','uDeploy'],86:['Rkt','Rocket'],88:['Dk Entre'],
 94:['App Dynamics'],95:['ElasticSearch','Elastic Sr'],96:['XL Impact'],101:['FortifySCA'],
 102:['Vault','HashiCorpVault'],104:['BlackDuck'],105:['Conjur'],106:['Service Now','SerNow'],
 108:['CollabNetV1','CollabNetVOne'],109:['JIRA'],111:['Agile Central','Ag Central'],113:['Pagerduty'],
 115:['Remedy'],117:['SignalSc'],120:['SAST']}
for n, aliases in ALIASES.items(): BY_ID[f'H{n:03}']['alias']=aliases

BY_NAME['Elastic Stack (ELK)']['componentes']=['H095','H010','H093']
BY_NAME['Elastic Stack (ELK)']['notas'].append('Conjunto mostrado como Elastic / ELK; Elasticsearch, Logstash y Kibana también tienen fichas propias. No sumar sus componentes como herramientas nuevas.')
for name in ['Vite','webpack']:
    BY_NAME[name]['notas'].append('La diapositiva se titula CONTAINERS. Se conserva esa ubicación del curso; revisar la categoría funcional antes de publicar el catálogo definitivo.')
BY_NAME['npm']['notas'].append('Aparece en Application Packaging y Continuous Integration. Se mantiene un solo registro con ambas referencias.')
BY_NAME['Azure DevOps']['notas'].append('Conservar la mención literal de la oferta laboral. Relación de nombres/alcance con VSTS y Team Foundation Server pendiente de definir; no son duplicados por simple coincidencia de marca.')
BY_NAME['Team Foundation Server']['notas'].append('Producto nombrado en la infografía; no fusionar automáticamente con VSTS ni con Azure DevOps.')
for name in ['Python','Bash','PowerShell','Node.js']:
    BY_NAME[name]['notas'].append('Lenguaje, shell o entorno de ejecución mencionado como tecnología de apoyo; no figura como casilla en la tabla.')
for name in ['Salesforce','Mailjet','Shopify','Force.com']:
    BY_NAME[name]['notas'].append('Ejemplo contextual de servicio/plataforma. Mantener en el inventario de menciones; no tratar automáticamente como herramienta DevOps obligatoria.')
BY_NAME['UrbanCode Deploy']['notas'].append('uDeploy se registra como alias, no como herramienta adicional; la identificación se contrasta con documentación de IBM.')
BY_NAME['CA Continuous Delivery Director']['notas'].append('La tabla abrevia Director y muestra OS. Nombre expandido a partir de Cc y la referencia del fabricante; conservar OS como dato de clase, no como licencia actual verificada.')
BY_NAME['Plutora Release']['notas'].append('La casilla muestra Pr / Release; nombre expandido con referencia del fabricante.')
BY_NAME['ElectricCloud']['notas'].append('La tabla utiliza un nombre de proveedor/producto abreviado. Mantener el rótulo histórico; no reemplazarlo por productos actuales sin verificación.')

# Symbols are not unique in the source (e.g. Sp, SL and Dt). Stable H### IDs identify records.
for t in TOOLS:
    t['pendientes']=['Redactar descripción funcional documentada','Redactar relaciones de uso con prácticas']
    if t['precio_curso'] is None: t['pendientes'].append('Completar modelo de precios: no está indicado para esta mención')
    if not t['categoria_curso']: t['pendientes'].append('Asignar categoría de la tabla con justificación')
    if t['logo_referencias']: t['pendientes'].append('Preparar archivo individual del logo localizado en las fuentes')
    else: t['pendientes'].append('Conseguir logo: la casilla de la tabla no sustituye el logo de marca')

# A practice is counted only where a practice hexagon names it in an Essence diagram.
PRACTICES_DATA = [
 ('PR01','Continuous integration of the software system','Integración continua del sistema de software','P02',2,
  'Integrar cambios, construir el código y ejecutar pruebas unitarias para reducir defectos y automatizar el proceso.',
  ['Write code','Check-out code','Check-in code','Merge version','Solve conflict','Build code','Run unit tests'],
  ['Repository','Version','Branch','Test suite'],['Development team member','DevOps Engineer'],['Development','Testing'],['Reducing defects','Automating process']),
 ('PR02','Continuous delivery of the software system','Entrega continua del sistema de software','P02',3,
  'Probar el sistema y desplegar el código automáticamente; el diagrama lo vincula con mejorar el sistema de software.',
  ['Test the software system automatically','Deploy the code automatically'],['Repository','Version','Branch','Test suite'],['Development team member','DevOps Engineer'],['Testing','Development'],['Improving software systems']),
 ('PR03','Continuous deployment of the software system','Despliegue continuo del sistema de software','P02',4,
  'Probar el sistema y liberar el código automáticamente, según la distinción utilizada en el diagrama del curso.',
  ['Test the software system automatically','Release the code automatically'],['Repository','Version','Branch','Test suite'],['Development team member','DevOps Engineer'],['Testing','Development'],['Guaranteeing software systems']),
 ('PR04','Continuous monitoring of the endeavor','Monitoreo continuo del esfuerzo de trabajo','P02',5,
  'Revisar infraestructura, analizar métricas, disparar alertas y generar registros de auditoría para mejorar el proceso.',
  ['Check the infrastructure automatically','Analyze performance metrics','Trigger instant alerts','Generate audit logs'],['Performance metrics','Instant alerts','Audit logs'],['DevOps Engineer'],['Management'],['Improving process']),
 ('PR05','Collaborative communication of the work','Comunicación colaborativa del trabajo','P02',6,
  'Organizar la comunicación del equipo mediante tableros, tarjetas, canales y mensajes.',
  ['Set up the integration','Create the main board of the project','Invite the development team','Create cards','Review cards','Create messages','Reply messages'],['Board','Card','Channel','Message'],['Development team member','DevOps Engineer'],['Management'],['Improving communication']),
 ('PR06','Strategic planning of the software project','Planificación estratégica del proyecto de software','P04',2,
  'Planificar el aseguramiento de calidad y producir su plan dentro de la fase de planificación.',
  ['Plan quality assurance'],['Software Quality Assurance Plan'],['Software Quality Assurance Engineer'],['Management'],[]),
 ('PR07','Activity-based conceptualization of software quality','Conceptualización de la calidad de software basada en actividades','P04',3,
  'Elaborar la conceptualización de la calidad de software como actividad de seguimiento del progreso.',
  ['Elaborate conceptual activity'],['Conceptualization'],['Software Quality Assurance Engineer'],['Management'],[]),
 ('PR08','Simulated certification of software quality','Certificación simulada de calidad de software','P04',4,
  'Presentar una prueba de certificación simulada como parte del seguimiento del progreso.',
  ['Present certification test'],['Simulated certification test'],['Software Quality Assurance Engineer'],['Management'],[]),
 ('PR09','Simulated design of the software system','Diseño simulado del sistema de software','P04',5,
  'Especificar la funcionalidad mediante casos de uso y sus especificaciones textuales.',
  ['Specify the functionality of the software system'],['Use Cases','Textual Specification of Use Cases'],['Software Engineer'],['Analysis'],[]),
 ('PR10','Automated testing of the software system','Pruebas automatizadas del sistema de software','P04',6,
  'Ejecutar pruebas automatizadas y obtener retroalimentación inmediata del sistema bajo prueba.',
  ['Execute automated tests','Gain immediate feedback of the system under test'],['Test','Release'],['Development team member'],['Testing','Stakeholder representation'],['Speeding up tests']),
 ('PR11','Test-driven development of the software system','Desarrollo guiado por pruebas (TDD)','P04',8,
  'Escribir una prueba que falla, implementar el código que la supera y refactorizar el código fuente.',
  ['Write a failing test','Write the source code to pass the test','Refactor the source code'],['Test','Source code'],['Development team member'],['Testing','Development'],['Reducing development time']),
 ('PR12','Acceptance Test-driven development of the software system','Desarrollo guiado por pruebas de aceptación (ATDD)','P04',9,
  'Definir criterios de aceptación, automatizar sus pruebas y controlar su integración y despliegue continuos.',
  ['Define acceptance criteria','Automate acceptance tests','Control continuous integration and deployment of the acceptance tests'],['Test','Source code'],['Quality assurance engineer'],['Testing'],['Validating acceptance criteria']),
 ('PR13','Behavior-driven development of the software system','Desarrollo guiado por comportamiento (BDD)','P04',10,
  'Definir y refinar escenarios, y automatizar los criterios de aceptación para asegurar el comportamiento del sistema.',
  ['Define scenarios','Automate acceptance criteria','Refine scenarios'],['Test','Source code'],['Development team member','Business Analyst'],['Analysis','Development'],['Ensuring the behavior of the software system']),
 ('PR14','Model-based development of software systems','Desarrollo basado en modelos de sistemas de software','P04',12,
  'Crear y validar modelos de prueba, generar y ejecutar casos, y evaluar resultados y trazabilidad.',
  ['Create test models','Validate test models','Define test coverage criteria','Generate test cases','Minimize test suite','Generate test data','Execute test cases','Trace requirements specification','Evaluate test verdict'],
  ['Requirements specification','Test coverage criteria','Test model','System under test','Test case','Test suite','Traceability matrix','Test verdict'],['Software development engineer in test'],['Analysis','Development','Testing'],[]),
]
PRACTICES=[]
DIAGRAMS=[]
for n,(pid,title,name,sid,page,desc,acts,products,roles,competencies,goals) in enumerate(PRACTICES_DATA,1):
    did=f'D{n:02}'
    references=[ref(sid,page,'diagrama_essence')]
    if pid=='PR01': references.append(ref('P03',2,'repeticion_diagrama'))
    if pid=='PR04': references.append(ref('P06I',2,'repeticion_diagrama'))
    PRACTICES.append({'id':pid,'nombre_original':title,'nombre_es':name,'descripcion':desc,
      'descripcion_tipo':'sintesis_del_diagrama','diagrama_id':did,'referencias':references,
      'actividades':acts,'productos_trabajo':products,'roles':roles,'competencias':competencies,'objetivos':goals})
    DIAGRAMS.append({'id':did,'nombre':name,'tipo':'practica','practica_id':pid,'referencias':references,
      'imagen':f'diagramas/{sid}-{page:02}.png','nota':'Imagen de la diapositiva original; la síntesis no cambia los rótulos del curso.'})

SUPPORT_DIAGRAMS=[
 ('D15','Proceso de pruebas detallado','proceso','P05',4,'Usa símbolos de actividades y productos de trabajo de Essence. No presenta un hexágono que nombre una práctica independiente.'),
 ('D16','Núcleo de Essence: alfas y relaciones','nucleo','P01',2,'Opportunity, Stakeholder, Requirements, Software System, Work, Team y Way of Working.'),
 ('D17','Núcleo de Essence: espacios de actividad','nucleo','P01',3,'Quince espacios de actividad agrupados en Customer, Solution y Endeavor.'),
 ('D18','Núcleo de Essence: competencias','nucleo','P01',4,'Stakeholder representation, Analysis, Development, Testing, Leadership y Management.'),
 ('D19','Elementos y notación de Essence','notacion','P01',5,'Leyenda del lenguaje: práctica, alfa, espacio de actividad, actividad, competencia, recurso, patrón, producto de trabajo y área de interés.'),
]
for did,name,kind,sid,page,note in SUPPORT_DIAGRAMS:
    DIAGRAMS.append({'id':did,'nombre':name,'tipo':kind,'practica_id':None,'referencias':[ref(sid,page,'diagrama_essence')],
                     'imagen':f'diagramas/{sid}-{page:02}.png','nota':note})
DIAGRAMS[14]['actividades']=['Plans the test','Monitors the test','Analyzes the test','Designs the test','Executes the test']
DIAGRAMS[14]['productos_trabajo']=['Test plan','Test progress report','Test completion report','Test basis','Test condition','Test case','Test data','Test object','Test suite']
PRACTICES[-1]['nota']='Se conserva el título Model-based development del hexágono. El contenido trata de modelos y generación de pruebas; no renombrar automáticamente como Model-based testing.'

# These topics are present but do not have their own named Essence practice diagram.
TOPICS=[
 ('Gestión de versiones','P03',[3,4,5,6,7,8,9,10,11,12,13,14],'Marco del tema; la práctica Essence asociada en la presentación es integración continua.'),
 ('Versionado semántico','P03',[14],'Buena práctica explícita: Major, Minor y Patch.'),
 ('Estrategias de ramas: Git Flow y GitHub / trunk-based flow','P03',[7,13,14],'Estrategias de trabajo; no son herramientas.'),
 ('Commits tempranos, frecuentes y trazables','P03',[14],'Buena práctica explícita.'),
 ('Comunicación transparente de releases y changelogs','P03',[14],'Buena práctica explícita.'),
 ('Automatización de pipelines CI/CD','P03',[14,15],'GitHub Actions es la herramienta; el pipeline es el proceso.'),
 ('Niveles, tipos y cuadrantes de pruebas','P04',[13],'Taxonomía de pruebas; no multiplicar las prácticas por cada etiqueta del cuadrante.'),
 ('Pruebas estáticas y dinámicas; revisiones y análisis estático','P05',[2,3],'Taxonomía conceptual sin diagrama Essence propio.'),
 ('Pruebas y criterios de aceptación, verificación y validación','P05',[5,6,7],'Conceptos de prueba definidos en el glosario.'),
 ('Stage rollout, dark launch y standard upgrade','P05',[8],'Estrategias de despliegue del esquema preconceptual.'),
 ('Internal user, canary release y A/B testing','P05',[8],'Tipos de prueba de funcionalidades para usuarios.'),
 ('Pruebas de estados de feature toggles','P05',[8],'Pruebas funcionales y no funcionales de estados de toggles.'),
 ('Monitoreo y alertas','P06I',[3,4],'Complementa PR04; no crear otra práctica duplicada.'),
 ('DevOps con servicios IaaS, PaaS y SaaS','P06I',[12,13],'Modelos de servicio, no nombres de herramientas.'),
 ('Empaquetado de aplicaciones','P06F',[4,5],'Tema explícito; npm aparece como herramienta.'),
 ('Despliegue mediante pipelines','P06F',[6,7,8],'Fases CI, empaquetado y CD.'),
 ('Dockerización','P06F',[9,10,11],'Dockerfile, imagen y contenedor son componentes, no herramientas independientes.'),
 ('Infraestructura como código (IaC)','P06F',[12,13,14,15],'Tema explícito sin diagrama Essence propio en las presentaciones entregadas.'),
]
TOPICS=[{'id':f'T{i:02}','nombre':n,'referencias':[ref(s,p,'tema_sin_diagrama_essence') for p in ps],'nota':note} for i,(n,s,ps,note) in enumerate(TOPICS,1)]

NON_ESSENCE=[
 ('P01',10,'Certificaciones y organizaciones','esquema_preconceptual'),('P01',11,'Ciclo DevOps','infografia'),
 ('P01',12,'Cultura, principios y componentes DevOps','esquema_preconceptual'),('P01',14,'Ecosistema de herramientas','infografia'),
 ('P02',7,'Categorías y atributos de herramientas','esquema_preconceptual'),('P02',8,'Tabla periódica','tabla'),
 ('P03',11,'Merging','grafico_versiones'),('P03',12,'Version management','esquema_preconceptual'),('P03',13,'Git Flow y GitHub flow','grafico_versiones'),
 ('P03',15,'GitHub Actions','esquema_preconceptual'),('P03',16,'Categorías y atributos de herramientas','esquema_preconceptual'),('P03',17,'Tabla periódica','tabla'),
 ('P04',11,'TDD vs ATDD vs BDD','diagrama_venn'),('P04',13,'Testing quadrants','matriz'),
 ('P05',2,'Contenido de ISTQB Foundation Level','cuadro'),('P05',3,'Types of testing','esquema_preconceptual'),('P05',8,'DevOps specific testing','esquema_preconceptual'),
 ('P05',9,'Categorías y atributos de herramientas','esquema_preconceptual'),('P05',10,'Tabla periódica','tabla'),
 ('P06I',5,'Categorías y atributos de herramientas','esquema_preconceptual'),('P06I',6,'Tabla periódica','tabla'),
 ('P06F',2,'IaaS / PaaS / SaaS','infografia'),('P06F',5,'npm','infografia'),('P06F',13,'How infrastructure as code works','infografia')]

CONTEXT_MENTIONS=[
 {'nombre':'axios','referencias':[ref('P06F',5)],'decision':'Paquete usado como ejemplo dentro del comando npm install axios; no se presenta como herramienta DevOps independiente.'},
 {'nombre':'HashiCorp','referencias':[ref('P01',14)],'decision':'Marca de proveedor sin producto específico en esta infografía. Vault y Terraform ya tienen registros propios.'},
 {'nombre':'JFrog','referencias':[ref('P01',14)],'decision':'Marca de proveedor; no se equipara automáticamente con un producto. Artifactory sí aparece nombrado en otras láminas.'},
 {'nombre':'Sonatype','referencias':[ref('P01',14)],'decision':'Marca de proveedor; Nexus tiene su propio registro explícito.'},
 {'nombre':'ServerAvatar','referencias':[ref('P06F',5)],'decision':'Marca del autor/editor de la infografía sobre npm, no herramienta enseñada en esa lámina.'},
 {'nombre':'OpenReplay','referencias':[ref('P06F',11)],'decision':'Marca de agua de la imagen de webpack; no añadir como herramienta exigida.'},
 {'nombre':'AltexSoft','referencias':[ref('P06F',13)],'decision':'Marca del autor/editor de la infografía de IaC; no añadir como herramienta exigida.'},
 {'nombre':'Logos pequeños no identificables con certeza','referencias':[ref('P06F',2)],'decision':'La ilustración IaaS/PaaS/SaaS incluye iconos secundarios de baja resolución. Se conserva la imagen fuente; no se inventan nombres.'},
 {'nombre':'Agile, SAFe y SRE','referencias':[ref('P01',8),ref('P01',9)],'decision':'Marcos/enfoques mencionados en una oferta laboral, no herramientas ni prácticas Essence adicionales del taller.'},
]

EXTERNAL_SOURCES=[
 {'id':'EXT01','titulo':'Broadcom: CA Continuous Delivery Director','url':'https://support.broadcom.com/web/ecx/support-content-notification/-/external/content/release-announcements/CA-Continuous-Delivery-Director-Release-and-Support-Lifecycle-Dates/3900','uso':'Desambiguar Director (Cc). No se tomaron precios ni fechas de soporte para el catálogo.'},
 {'id':'EXT02','titulo':'Plutora Release: ficha del fabricante','url':'https://www.plutora.com/resources/datasheet-plutora-release-management','uso':'Desambiguar Pr / Release. No se tomaron precios actuales.'},
]
BY_NAME['CA Continuous Delivery Director']['referencias_externas']=['EXT01']
BY_NAME['Plutora Release']['referencias_externas']=['EXT02']

EXTERNAL_SOURCES.extend([
 {'id':'EXT03','titulo':'IBM: UrbanCode Deploy, an overview','url':'https://www.ibm.com/docs/en/order-management-sw/9.5.0?topic=deploy-urbancode','uso':'Verificar que uDeploy es el nombre anterior de UrbanCode Deploy.'},
 {'id':'EXT04','titulo':'Microsoft: Introducing Azure DevOps','url':'https://learn.microsoft.com/en-us/azure/devops/release-notes/2018/sep-10-azure-devops-launch','uso':'Consolidar VSTS y la mención genérica Azure DevOps como una misma familia con nombres históricos. No agregar servicios no nombrados en las diapositivas.'}
])
BY_NAME['UrbanCode Deploy']['referencias_externas']=['EXT03']
old_azure=BY_NAME['Azure DevOps']
vsts=BY_NAME['VSTS']
vsts['alias'].extend(['Azure DevOps','Azure DevOps Services'])
vsts['referencias'].extend(old_azure['referencias'])
vsts['referencias_externas']=['EXT04']
vsts['notas'].append('Azure DevOps de P01:7 se consolida aquí como evolución de VSTS, verificada con Microsoft. Se conserva VSTS como nombre del curso. Team Foundation Server permanece separado como producto local.')
TOOLS.remove(old_azure)
del BY_ID[old_azure['id']]
del BY_NAME['Azure DevOps']
BY_NAME['Git']['referencias'].extend([ref('P00',5,'programa_curso'),ref('P03',14,'buena_practica')])
BY_NAME['GitHub Actions']['referencias'].append(ref('P00',5,'programa_curso'))

def build():
    # Structural checks that catch missing records and broken source references.
    assert sorted(t['numero_tabla'] for t in TOOLS if t['numero_tabla'])==list(range(1,121))
    assert len(BY_ID)==len(TOOLS)==len(BY_NAME)
    assert len(PRACTICES)==14 and len(DIAGRAMS)==19
    for group in [TOOLS,PRACTICES,DIAGRAMS,TOPICS]:
        for item in group:
            for r in item['referencias']:
                assert 1<=r['pagina']<=SOURCE_LOOKUP[r['fuente']]['numero_paginas'],(item['id'],r)
    for d in DIAGRAMS: assert (OUT/d['imagen']).is_file(),d
    requirement_original=Path(r'C:\Users\USUARIO\Downloads\supletorio 1.pdf')
    shutil.copy2(requirement_original,OUT/'fuentes/supletorio.pdf')
    counts=collections.Counter(t['alcance'] for t in TOOLS)
    data={
      'version':'1.0','fecha':'2026-11-18','titulo':'Inventario del supletorio de Integración y Despliegue de Software',
      'estado':'Inventario de fuentes completado; las fichas comerciales y relaciones de uso se desarrollan en el siguiente paso.',
      'criterios':[
        'Base obligatoria: las 120 casillas de la tabla reproducida en P05 y P06I, más las herramientas presentadas fuera de ella en P04/P05/P06I/P06F.',
        'La inclusión de la tabla completa es el criterio conservador acordado en el plan, pues el enunciado pide todas las herramientas de esas presentaciones.',
        'Las menciones exclusivas de P01/P02/P03 se conservan como complementarias para trazabilidad; muchas ya están en la tabla y no se duplican.',
        'Las categorías y los modelos OS/FR/FM/PA/EN se transcriben como datos del curso, no como información comercial vigente.',
        'Los símbolos no son claves únicas: la tabla repite Sp, SL y Dt. Se usan IDs H###.',
        'Se cuentan 14 prácticas nombradas en hexágonos de Essence. El proceso de pruebas, el núcleo y la leyenda se guardan como diagramas de apoyo, no como prácticas inventadas.',
        'Un diagrama repetido en otra presentación se vincula a la misma práctica; se conservan sus referencias y ambas imágenes de página.',
        'Los nombres expandidos y las deduplicaciones dudosas se explican en notas. No se actualizan marcas históricas de forma silenciosa.',
        'Los null significan información no especificada o no elaborada en esta etapa; nunca significan gratuito o inexistente.'
      ],
      'resumen':{'presentaciones':len(SOURCES),'paginas_revisadas':sum(s['numero_paginas'] for s in SOURCES),'herramientas':len(TOOLS),
                 'por_alcance':dict(counts),'herramientas_requeridas':counts['base_tabla']+counts['adicional_requerida'],
                 'practicas_essence':len(PRACTICES),'diagramas_essence_unicos':len(DIAGRAMS),
                 'apariciones_diagramas':sum(len(d['referencias']) for d in DIAGRAMS),
                 'categorias_tabla':len(CATEGORIES)},
      'fuentes':SOURCES,'fuentes_externas':EXTERNAL_SOURCES,
      'enunciado':{'nombre':'supletorio 1.pdf','archivo':'fuentes/supletorio.pdf','ruta_original':str(requirement_original),'sha256':hashlib.sha256(requirement_original.read_bytes()).hexdigest()},
      'categorias':[{'id':k,'nombre_original':v[0],'nombre_es':v[1]} for k,v in CATEGORIES.items()],
      'modelos_precio_curso':PRICES,'herramientas':TOOLS,'practicas':PRACTICES,'diagramas':DIAGRAMS,
      'temas_sin_diagrama_essence':TOPICS,
      'graficos_no_essence':[{'fuente':s,'pagina':p,'nombre':n,'tipo':t} for s,p,n,t in NON_ESSENCE],
      'menciones_contextuales_y_exclusiones':CONTEXT_MENTIONS,
      'pendientes_generales':[
        'Preparar logos individuales con calidad suficiente: el inventario señala dónde hay logos en las presentaciones.',
        'Redactar descripciones funcionales de herramientas y usos por práctica con evidencia; las láminas de herramientas contienen principalmente nombres, logos y categorías.',
        'Completar los modelos de precios de las herramientas adicionales cuando se construyan sus fichas.',
        'Revisar clasificación de Vite y webpack, que aparecen bajo Containers, sin alterar el registro de origen.',
        'Conservar la distinción entre Team Foundation Server y la familia VSTS / Azure DevOps; la deduplicación de esta última está documentada.',
        'Preservar las 4 imágenes del núcleo/notación y el proceso detallado como material Essence de apoyo en la aplicación.'
      ]
    }
    (OUT/'inventario.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/'herramientas.json').write_text(json.dumps(TOOLS,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/'practicas.json').write_text(json.dumps(PRACTICES,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/'diagramas.json').write_text(json.dumps(DIAGRAMS,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(data['resumen'],ensure_ascii=False,indent=2))
    return data

if __name__=='__main__':
    build()
