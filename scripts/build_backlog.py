from pathlib import Path
from html import escape
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'planificacion'
OUT.mkdir(exist_ok=True)
INV = json.loads((ROOT / 'inventario/inventario.json').read_text(encoding='utf-8'))
OWNER = 'Juan José Alzate'
BOARD = 'https://trello.com/b/5CSrY3pF/devops-tools-project'
cards = []

def add(title, phase, description, criteria, deps=(), scope=(), refs=(), origin='Requisito del taller', tool_ids=()):
    ident = f'DEVOPS-{len(cards)+1:03}'
    name = f'[{ident}] {title}'
    done = 'Todos los criterios de aceptación están verificados. Se registra evidencia concreta (archivo, prueba o commit) y se resuelven los pendientes que impidan el uso del resultado por las tareas dependientes.'
    parts = [f'**{title}**', f'**Responsable Principal:** {OWNER}', '**Descripción:**\n'+description]
    if scope: parts += ['**Alcance:**\n'+'\n'.join('- '+s for s in scope)]
    parts += ['**Criterios de aceptación:**\n'+'\n'.join('- '+c for c in criteria), '**Criterio de terminado:**\n'+done,
              '**Dependencias:** '+(', '.join(f'DEVOPS-{d:03}' for d in deps) or 'Sin dependencias.'), '**Origen:** '+origin]
    if refs: parts += ['**Referencias:**\n'+'\n'.join('- '+r for r in refs)]
    cards.append(dict(id=ident, orden=len(cards)+1, fase=phase, titulo=title, responsable_principal=OWNER,
        lista_destino='Backlog', descripcion=description, alcance=list(scope), criterios_aceptacion=list(criteria), criterio_terminado=done,
        dependencias=[f'DEVOPS-{d:03}' for d in deps], referencias=list(refs), origen=origin, herramientas=list(tool_ids),
        trello=dict(name=name, desc='\n\n'.join(parts), id=None, idList=None, idMembers=[], due=None), estado_publicacion='pendiente_mcp'))

add('Consolidar requisitos y alcance',2,'Convertir el enunciado en una matriz verificable que guíe diseño, implementación y entrega.',[
    'La matriz incluye registrar y actualizar herramientas, prácticas y usos; documenta todos los campos requeridos.',
    'El index es un esquema preconceptual navegable; JSON y almacenamiento Chrome comparten estructura.',
    'Se documenta el alcance conservador de 144 herramientas, 14 prácticas y 19 diagramas; las 55 menciones secundarias permanecen trazables en el inventario.',
    'Se identifican los entregables: tarjetas Trello, HTML, CSS, JSON y recursos adicionales.'],refs=['supletorio 1.pdf, página 1'])
add('Revisar y cerrar el inventario existente',1,'Revisar el inventario ya preparado y cerrar las discrepancias sin repetir la extracción.',[
    'Se cotejan 8 presentaciones y las referencias por página del inventario.',
    'Los alias VSTS/Azure DevOps y uDeploy/UrbanCode no crean duplicados; los símbolos repetidos no se usan como identificadores.',
    'Se distinguen 19 diagramas únicos de 21 apariciones y 14 prácticas nombradas.',
    'Se registran datos faltantes y categorías que requieren explicación, incluidos Vite y webpack.'],[1],refs=['inventario/inventario.json','inventario/inventario.html'])
add('Mantener planificación y evidencias en Trello',2,'Preparar y cargar las tarjetas del proyecto mediante el MCP de Trello; conservar evidencia de los avances reales.',[
    'Se verifica el tablero 5CSrY3pF y se identifica la lista Backlog antes de escribir.',
    'Se cargan las 42 tarjetas sin duplicar sus IDs DEVOPS; todas quedan inicialmente en Backlog y con el responsable escrito en la descripción.',
    'La asignación de miembro usa una cuenta verificada; no se inventa un ID de usuario ni se invita a terceros.',
    'Se guardan IDs/URLs de tarjetas y evidencia de carga; se enlazan los commits y pruebas ejecutados sin afirmar trabajo pendiente como completado.'],[1],refs=[BOARD])
add('Definir modelo de datos y contratos JSON',3,'Definir herramientas, prácticas, diagramas y relaciones de uso con claves estables e integridad referencial.',[
    'Herramienta contiene ID, nombre, descripción, logo, modelo de precio y categoría; práctica contiene ID, nombre, descripción e imagen Essence.',
    'Uso enlaza una herramienta y una práctica mediante IDs y contiene una descripción en términos de cultura DevOps.',
    'Se separan los diagramas de apoyo de las prácticas y se conservan fuentes, alias y datos históricos del curso.',
    'El JSON de carga, los respaldos y el estado persistido tienen el mismo contrato versionado.'],[1,2])
add('Diseñar el esquema preconceptual del sistema',3,'Representar el ingeniero DevOps, los conceptos, sus atributos y las relaciones estáticas y dinámicas.',[
    'El esquema incluye los conceptos Herramienta, Práctica, Uso, Categoría, Modelo de precio y Diagrama, con sus atributos relevantes.',
    'Las seis relaciones dinámicas de registro y actualización tienen un destino de interfaz definido.',
    'Se distinguen visualmente conceptos, relaciones estáticas y relaciones dinámicas y se explica la notación.'],[4])
add('Diseñar pantallas y recorridos',3,'Definir la navegación desde el esquema hasta formularios, catálogos y consulta de diagramas.',[
    'Cada uno de los seis recorridos tiene entrada, campos, validación, guardado, confirmación y regreso.',
    'Los catálogos permiten localizar registros antes de actualizarlos; los formularios muestran los valores existentes.',
    'Se prevén estados vacíos, errores, vista previa de imágenes y uso por teclado en móvil y escritorio.'],[5],origin='Diseño necesario para implementar el taller')
add('Preparar estructura y ejecución local',4,'Crear una aplicación HTML5, CSS y JavaScript sin servidor de base de datos.',[
    'Los archivos de interfaz, código, datos y recursos tienen rutas relativas y responsabilidades separadas.',
    'Existe un comando documentado para servir la aplicación localmente y abrirla en Chrome.',
    'La página inicial carga correctamente y no necesita credenciales ni servicios de terceros para consultar los datos.'],[4,6],origin='Implementación del taller')
add('Implementar persistencia en Chrome',4,'Guardar el estado de la aplicación en el almacenamiento del navegador con carga inicial desde JSON.',[
    'Los datos iniciales se importan una sola vez cuando no existe una base local válida.',
    'Registrar y actualizar persiste después de recargar y reabrir el navegador con el mismo origen y perfil.',
    'Un error de cuota, almacenamiento bloqueado o datos corruptos se informa sin borrar ni sustituir silenciosamente datos existentes.',
    'Se usan IDs estables y una clave propia de la aplicación; no se modifica almacenamiento ajeno.'],[4,7])
add('Implementar respaldo y restauración JSON',4,'Permitir transportar y recuperar la base simulada mediante un archivo JSON.',[
    'La exportación incluye el estado completo y una versión de formato.',
    'La restauración valida estructura, valores e IDs relacionados antes de escribir.',
    'El reemplazo requiere una acción deliberada; un archivo inválido deja intactos los datos existentes.',
    'Exportar y restaurar conserva registros y sus imágenes cargadas por el usuario.'],[8],origin='Apoyo propuesto para reproducibilidad y respaldo')

for category in INV['categorias']:
    batch = [t for t in INV['herramientas'] if t['alcance'] in ['base_tabla','adicional_requerida'] and t['categoria_curso']==category['id']]
    criteria = [f'Las {len(batch)} herramientas enumeradas tienen una descripción funcional específica en español y mantienen sus IDs y alias.',
                'Cada herramienta tiene un logo local legible y una referencia que permite rastrear su origen.',
                'La categoría sigue la tabla del curso o explica una corrección; se conserva por separado la clasificación original.',
                'El modelo de precio del curso se presenta como histórico. Si la fuente no lo indica, se documenta esa ausencia o se verifica una fuente oficial con fecha, sin inventar gratuidad.',
                'No quedan referencias a imágenes inexistentes ni descripciones vacías o idénticas para todo el grupo.']
    if category['id']=='CONT': criteria += ['Vite y webpack se describen como herramientas de construcción y se explica por qué aparecen bajo Containers en la presentación.']
    add('Completar fichas: '+category['nombre_es'],5,'Preparar las fichas del grupo '+category['nombre_original']+' para cargar el catálogo de la aplicación.',criteria,[2,4],
        [t['id']+' · '+t['nombre'] for t in batch],['inventario/herramientas.json; referencias por herramienta','P05, página 10; P06I, página 6; láminas específicas del inventario'],tool_ids=[t['id'] for t in batch])

add('Preparar las 14 fichas de prácticas Essence',5,'Revisar y completar las prácticas identificadas en los diagramas del curso.',[
    'Las 14 prácticas tienen nombre, descripción específica y vínculo al diagrama correcto.',
    'Se conserva el título original y la referencia de presentación/página.',
    'Las descripciones distinguen CI, entrega continua, despliegue continuo, TDD, ATDD, BDD y desarrollo basado en modelos.',
    'El núcleo, la leyenda y el proceso detallado de pruebas no se convierten en prácticas inventadas.'],[2,4],
    [p['id']+' · '+p['nombre_es'] for p in INV['practicas']],['inventario/practicas.json'])
add('Preparar catálogo e imágenes de los 19 diagramas',5,'Incorporar los diagramas Essence de prácticas y apoyo con imágenes locales ampliables.',[
    'Los 19 diagramas únicos tienen imagen legible y referencias a sus 21 apariciones.',
    'Se distinguen 14 diagramas de prácticas y 5 diagramas de proceso, núcleo o notación.',
    'Las imágenes se pueden ampliar y no se recorta información del diagrama.',
    'Se conserva la trazabilidad a las láminas originales y no se duplican prácticas por diagramas repetidos.'],[2],
    [d['id']+' · '+d['nombre'] for d in INV['diagramas']],['inventario/diagramas.json','inventario/diagramas/'])
add('Redactar relaciones de uso herramientas-prácticas',5,'Relacionar herramientas pertinentes con prácticas y explicar su aporte a la cultura DevOps.',[
    'Cada una de las 14 prácticas tiene al menos un ejemplo pertinente y específico de uso.',
    'Cada relación contiene IDs válidos y explica qué se hace, cómo y qué aporta a colaboración, automatización, retroalimentación o trazabilidad.',
    'No se atribuyen capacidades inexistentes ni se crean todas las combinaciones posibles de forma artificial.',
    'No hay parejas herramienta-práctica duplicadas.'],[24,*range(10,24)],refs=['Diagramas y actividades de las prácticas; fichas de herramientas'],origin='Requisito del taller; cobertura mínima por práctica propuesta')
add('Consolidar los JSON iniciales',5,'Generar la base inicial con las fichas completas, sus imágenes y las relaciones de uso.',[
    'El archivo contiene 144 herramientas, 14 prácticas, 19 diagramas y relaciones válidas.',
    'Los campos obligatorios están completos; las ausencias de información comercial se declaran explícitamente.',
    'No hay IDs duplicados, referencias rotas ni recursos ausentes.',
    'El contrato coincide con el estado guardado en Chrome y permite recrear la aplicación en un perfil nuevo.'],[4,*range(10,27)])
add('Implementar el index como esquema navegable',4,'Construir la página inicial a partir del esquema preconceptual completo.',[
    'El elemento central de index.html es el esquema, con relaciones y atributos legibles.',
    'Las seis relaciones dinámicas abren las interfaces correspondientes de registro o actualización.',
    'Los enlaces funcionan con teclado y en pantallas pequeñas; existe leyenda de notación.'],[5,6,7])
add('Implementar registro de herramientas',4,'Crear el formulario de herramienta con los cinco campos del enunciado.',[
    'Se pueden introducir logo, nombre, descripción, modelo de precio y categoría.',
    'Campos vacíos, nombres duplicados e imágenes inválidas muestran mensajes claros.',
    'El registro correcto obtiene un ID estable, aparece en el catálogo y persiste al recargar.',
    'El logo tiene vista previa y se conserva en el respaldo.'],[6,8,27])
add('Implementar consulta y actualización de herramientas',4,'Buscar herramientas existentes y actualizar sus fichas.',[
    'El catálogo permite búsqueda y filtro por categoría con un estado vacío comprensible.',
    'El formulario de edición muestra todos los valores actuales y permite cambiar los campos del enunciado.',
    'Guardar conserva el ID y las relaciones de uso; cancelar no modifica datos.',
    'La ficha y el catálogo reflejan los cambios después de recargar.'],[29])
add('Implementar registro de prácticas',4,'Crear prácticas con nombre, descripción e imagen de diagrama Essence.',[
    'El formulario exige nombre, descripción e imagen válida del diagrama.',
    'Se muestra vista previa; los nombres duplicados se detectan.',
    'Una práctica nueva aparece en el catálogo, tiene ID estable y persiste al recargar.'],[6,8,24,25])
add('Implementar actualización de prácticas y galería Essence',4,'Consultar prácticas, editar sus datos y explorar los diagramas del curso.',[
    'Se puede editar nombre, descripción e imagen sin cambiar el ID ni romper relaciones de uso.',
    'La galería contiene los 19 diagramas iniciales y distingue prácticas de apoyo.',
    'Las imágenes se amplían y muestran su fuente; los diagramas repetidos mantienen todas sus referencias.',
    'Cancelar conserva los datos anteriores; guardar persiste los cambios.'],[31])
add('Implementar registro de usos',4,'Registrar una herramienta aplicada a una práctica con una descripción de su uso en cultura DevOps.',[
    'Los selectores solo ofrecen herramientas y prácticas existentes.',
    'La descripción es obligatoria y la ayuda solicita explicar el uso y su aporte cultural.',
    'Una pareja repetida se dirige a edición o muestra un error; no se generan duplicados.',
    'El uso guardado tiene ID estable y se muestra asociado a ambas entidades.'],[4,8,26,29,31])
add('Implementar consulta y actualización de usos',4,'Localizar relaciones existentes y editar su descripción o entidades relacionadas.',[
    'Se puede filtrar por herramienta y práctica y consultar el texto completo.',
    'La edición valida referencias y evita duplicar otra pareja existente.',
    'Los cambios conservan el ID, se reflejan en consulta y persisten tras recargar.',
    'Cancelar deja intacta la relación original.'],[33])
add('Ajustar diseño adaptable, accesibilidad y mensajes',6,'Revisar la interfaz completa en escritorio, móvil y navegación por teclado.',[
    'A 375, 768 y 1280 píxeles no hay desbordamiento horizontal general ni controles inaccesibles.',
    'Los formularios tienen etiquetas; el foco es visible y los mensajes de guardado/error se anuncian.',
    'Las imágenes tienen texto alternativo y se pueden ampliar sin perder navegación.',
    'Botones, filtros, estados vacíos y navegación usan un estilo consistente y texto comprensible.'],[28,30,32,34],origin='Calidad de implementación')
add('Auditar exactitud y cobertura de contenidos',6,'Contrastar la base de datos terminada con el inventario y las fuentes del curso.',[
    'Una verificación comprueba los 144 IDs de herramientas, 14 prácticas y 19 diagramas.',
    'Se comprueba la existencia de cada logo e imagen y de todas las referencias entre entidades.',
    'Se explican las correcciones de categoría y no se presentan precios históricos como vigentes.',
    'Las 14 prácticas tienen usos pertinentes y la matriz de requisitos enlaza cada requisito con su implementación.'],[27],origin='Verificación del taller')
add('Probar los seis flujos y la persistencia',6,'Ejecutar registro y actualización de herramientas, prácticas y usos con datos de prueba aislados.',[
    'Los seis flujos se completan desde la navegación del esquema.',
    'La recarga conserva los cambios y no reinicializa la base.',
    'Exportación y restauración producen una base equivalente, incluidas imágenes de usuario.',
    'Se guarda un reporte reproducible con los resultados reales y se corrigen los fallos detectados.'],[9,28,30,32,34],origin='Verificación del taller')
add('Probar validaciones y recuperación de errores',6,'Probar entradas inválidas y errores de persistencia sin comprometer la base existente.',[
    'Se rechazan campos vacíos, duplicados, referencias inexistentes y formatos no válidos.',
    'Los textos con HTML se muestran como texto y no ejecutan código.',
    'JSON inválido, almacenamiento corrupto y errores de cuota muestran errores sin pérdida silenciosa.',
    'Los ensayos usan perfiles de prueba; no se borran datos personales del navegador.'],[8,9,29,30,31,32,33,34],origin='Calidad y robustez')
add('Verificar ejecución limpia en navegador Chromium',6,'Ejecutar la entrega desde una copia limpia y un perfil aislado; documentar el navegador utilizado.',[
    'Se reproduce el arranque con los pasos de la guía y sin archivos del entorno de desarrollo.',
    'La base inicial carga y todos los recursos locales responden correctamente.',
    'No hay errores de JavaScript ni solicitudes de recursos esenciales fallidas.',
    'Se documenta si la verificación fue en Chrome, Chromium o Edge y cualquier límite de equivalencia.'],[35,36,37,38],origin='Verificación de compatibilidad con Chrome')
add('Redactar guía de ejecución y uso',7,'Documentar cómo abrir, usar y respaldar la aplicación.',[
    'La guía incluye requisitos, comando de arranque, URL local y los seis recorridos.',
    'Se explica que los datos dependen del perfil y origen del navegador, y cómo hacer un respaldo.',
    'Se describen carpetas, fuentes del curso, alcance, tablero real y limitaciones conocidas.',
    'Los pasos se contrastan con una ejecución limpia.'],[39],origin='Apoyo propuesto para entregar un proyecto reproducible')
add('Empaquetar la entrega del proyecto',7,'Preparar un ZIP con los archivos necesarios para ejecutar y revisar el proyecto.',[
    'El paquete incluye HTML, CSS, JavaScript, JSON, logos, diagramas, guía y planificación.',
    'Se incluyen referencias a Trello y evidencia disponible, diferenciando una carga pendiente si el MCP no está disponible.',
    'Se excluyen credenciales, archivos temporales, dependencias instaladas y datos de pruebas.',
    'El ZIP se extrae en una ubicación de prueba y supera la verificación de arranque.'],[39,40])
add('Revisar entrega final y preparar envío a MinasLap',7,'Revisar el cumplimiento y dejar el paquete listo para que el responsable entregue en MinasLap.',[
    'Cada requisito del enunciado tiene evidencia y se identifican pendientes reales de entrega.',
    'Se verifica el enlace al tablero y el estado real de publicación de sus tarjetas.',
    'Se comprueba que el paquete final corresponde a la versión verificada y al historial de commits.',
    'La guía recuerda el 24 de noviembre indicado en el enunciado, sin inventar hora ni confirmar envío no realizado.'],[3,41])

assert len(cards)==42
expected={t['id'] for t in INV['herramientas'] if t['alcance'] in ['base_tabla','adicional_requerida']}
covered=[tid for c in cards for tid in c['herramientas']]
assert set(covered)==expected and len(covered)==len(expected)==144
assert all(int(dep.split('-')[1])<c['orden'] for c in cards for dep in c['dependencias'] if c['orden'] not in [29]) # data-first order, card 29 depends on seed 27
data=dict(version=1,fecha='2026-11-18',tablero_url=BOARD,tablero_shortlink='5CSrY3pF',tablero_id=None,
    lista_destino='Backlog',lista_id=None,responsable_principal=OWNER,miembro_trello_id=None,
    estado_publicacion='pendiente_mcp',nota='Archivo de preparación; no es una confirmación de creación ni un formato nativo de importación de Trello.',
    fases={'1':'Inventario','2':'Planificación','3':'Diseño','4':'Implementación','5':'Contenido y carga inicial','6':'Verificación','7':'Entrega'},tarjetas=cards)
(OUT/'trello-backlog.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
rows=[]
for c in cards:
    rows.append(f'<details class="card" id="{c["id"]}" data-phase="{c["fase"]}"><summary><span>{c["id"]} · Fase {c["fase"]} · Backlog</span><strong>{escape(c["titulo"])}</strong></summary><div class="body"><p><b>Responsable principal:</b> {OWNER}</p><p>{escape(c["descripcion"])}</p>'+(' <h3>Alcance</h3><ul>'+''.join('<li>'+escape(s)+'</li>' for s in c['alcance'])+'</ul>' if c['alcance'] else '')+'<h3>Criterios de aceptación</h3><ul>'+''.join('<li>'+escape(s)+'</li>' for s in c['criterios_aceptacion'])+'</ul><h3>Criterio de terminado</h3><p>'+escape(c['criterio_terminado'])+'</p><p><b>Dependencias:</b> '+(', '.join(f'<a href="#{d}">{d}</a>' for d in c['dependencias']) or 'Ninguna')+'</p><p><b>Origen:</b> '+escape(c['origen'])+'</p><p><b>Referencias:</b> '+escape('; '.join(c['referencias']) or 'Matriz de requisitos del proyecto')+'</p></div></details>')
html='''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Backlog · DevOps Atlas</title><style>
*{box-sizing:border-box}body{margin:0;background:#f3f6fb;color:#142a43;font:16px/1.65 system-ui}main{max-width:1100px;margin:auto;padding:40px 24px}h1{font-size:clamp(30px,5vw,48px);line-height:1.15}a{color:#0758a5}header p{max-width:78ch}.tools{display:flex;gap:12px;flex-wrap:wrap;margin:28px 0}input,select,button{font:inherit;padding:12px;border:1px solid #8a9bb1;border-radius:8px;background:white;color:inherit}input{flex:1;min-width:180px}button{cursor:pointer}.card{border:1px solid #cbd6e5;border-radius:12px;background:white;margin:12px 0;overflow:hidden}summary{padding:20px;cursor:pointer}summary span{display:block;font-size:14px;color:#486078}summary strong{font-size:19px}.body{padding:0 24px 24px}.body li{margin:8px 0}h3{font-size:17px}a,li,p,strong{overflow-wrap:anywhere}:focus-visible{outline:3px solid #0b83c5;outline-offset:3px}[hidden]{display:none!important}.badge{background:#e1eefb;border-radius:20px;padding:7px 13px;display:inline-block;font-size:14px}@media print{.tools{display:none}main{padding:0}.card{break-inside:avoid}details>.body{display:block}}</style><main><header><span class="badge">42 tarjetas · 7 fases · Juan José Alzate</span><h1>El proyecto, tarea por tarea.</h1><p>Contenido preparado para el Backlog de <a href="'''+BOARD+'''">DevOps Tools Project</a>. Cada tarjeta incluye descripción, criterios de aceptación, criterio de terminado y dependencias. El estado de carga real se registra en el JSON; esta vista no acredita publicación en Trello.</p><p><a href="trello-backlog.json" download>Descargar contenido JSON</a> · <a href="../inventario/inventario.html">Ver inventario y fuentes</a></p></header><div class="tools"><input id="search" type="search" aria-label="Buscar tarjetas" placeholder="Buscar tarjeta, herramienta o criterio"><select id="phase" aria-label="Filtrar por fase"><option value="all">Todas las fases</option>'''+''.join(f'<option value="{n}">{n} · {escape(name)}</option>' for n,name in data['fases'].items())+'''</select><button id="expand">Expandir visibles</button></div><p id="count" aria-live="polite"></p>'''+''.join(rows)+'''</main><script>
const cards=[...document.querySelectorAll('.card')],search=document.querySelector('#search'),phase=document.querySelector('#phase');const norm=s=>s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();function filter(){cards.forEach(c=>c.hidden=!(norm(c.textContent).includes(norm(search.value))&&(phase.value==='all'||phase.value===c.dataset.phase)));document.querySelector('#count').textContent=cards.filter(c=>!c.hidden).length+' tarjetas visibles';}search.addEventListener('input',filter);phase.addEventListener('change',filter);document.querySelector('#expand').onclick=()=>cards.filter(c=>!c.hidden).forEach(c=>c.open=true);window.addEventListener('hashchange',()=>{const c=document.getElementById(location.hash.slice(1));if(c){c.hidden=false;c.open=true;c.scrollIntoView();}});filter();</script></html>'''
(OUT/'backlog.html').write_text(html,encoding='utf-8')
print(json.dumps({'tarjetas':len(cards),'herramientas_cubiertas':len(covered),'responsable':OWNER},ensure_ascii=False))
