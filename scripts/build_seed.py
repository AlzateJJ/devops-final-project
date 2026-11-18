from pathlib import Path
import json, sys, shutil
from tool_content import TOOLS
from price_content import PRICES
from usage_content import USAGES

ROOT=Path(__file__).resolve().parents[1]
INV=json.loads((ROOT/'inventario/inventario.json').read_text(encoding='utf-8'))
LOGOS=json.loads((ROOT/'app/data/logo-sources.json').read_text(encoding='utf-8'))
TARGET=ROOT/'app/data/database.json'
db=json.loads(TARGET.read_text(encoding='utf-8'))
required=[t for t in INV['herramientas'] if t['alcance'] in ['base_tabla','adicional_requerida']]
assert len(required)==len(TOOLS)==len(LOGOS)==144
def refs(rows):
    return [{'source':r['fuente'],'page':r['pagina']} for r in rows]
db['tools']=[]
for t in required:
    ident=t['id'];enrichment=TOOLS[ident];notes=list(t['notas']);price=PRICES.get(ident)
    notes=[n for n in notes if 'pendiente' not in n.lower()]
    category=t['categoria_curso']
    if ident in ['H140','H141']:
        category='CI'
        notes.append('La lámina P06F:11 agrupa esta herramienta bajo Containers. Aquí se clasifica en Integración continua por su función en la construcción; se conserva la categoría original de la fuente.')
    if price:notes.append(price['scope'])
    db['tools'].append(dict(id=ident,name=t['nombre'],description=enrichment['description'],logo=LOGOS[ident]['file'],
        price=t['precio_curso'] or price['model'],category=category,aliases=t['alias'],sourceCategory=t['categoria_curso'],
        sourcePrice=t['precio_curso'],references=refs(t['referencias']),notes=notes,logoSource=LOGOS[ident]['source'],
        officialURL=enrichment['officialURL'],priceVerification=price))
diagram_dir=ROOT/'app/assets/diagramas';diagram_dir.mkdir(exist_ok=True)
for d in INV['diagramas']:
    shutil.copy2(ROOT/'inventario'/d['imagen'],diagram_dir/Path(d['imagen']).name)
db['diagrams']=[dict(id=d['id'],name=d['nombre'],type=d['tipo'],practiceId=d['practica_id'],image='assets/diagramas/'+Path(d['imagen']).name,references=refs(d['referencias'])) for d in INV['diagramas']]
diagram_lookup={d['id']:d for d in db['diagrams']}
db['practices']=[dict(id=p['id'],name=p['nombre_es'],originalName=p['nombre_original'],description=p['descripcion'],
    diagramId=p['diagrama_id'],image=diagram_lookup[p['diagrama_id']]['image'],references=refs(p['referencias']),imageSource='Diagrama original del curso; las fuentes por página aparecen debajo de la imagen.') for p in INV['practicas']]
db['practices'][1]['description']='Organiza pruebas y despliegues automatizados para mantener el sistema preparado para una entrega. El diagrama del curso incluye probar el sistema y desplegar el código automáticamente, con el objetivo de mejorar el software. En entrega continua, la decisión de liberarlo a producción puede conservar una aprobación.'
db['practices'][2]['description']='Lleva los cambios que superan las verificaciones hasta su liberación automática. El diagrama del curso incluye probar el sistema y liberar el código automáticamente. La práctica requiere observar el resultado y mantener criterios de calidad que permitan automatizar la liberación.'
db['usages']=USAGES
db['meta'].update(contentVersion='1.0.0',author='Juan José Alzate',sourceDate='2026-11-18',
    scope='144 herramientas del bloque exigido; el inventario conserva por separado 55 menciones complementarias o contextuales.',
    pricePolicy='Los 120 modelos de la tabla se conservan como referencia histórica. Los 24 adicionales usan una clasificación editorial respaldada por fuentes oficiales y fechada; no se cotizan importes.')
TARGET.write_text(json.dumps(db,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:len(db[k]) for k in ['tools','practices','diagrams','usages']}))
