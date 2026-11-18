from pathlib import Path
from html import escape as esc
import collections
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'inventario'
D = json.loads((OUT/'inventario.json').read_text(encoding='utf-8'))
SOURCES={s['id']:s for s in D['fuentes']}
CATS={c['id']:c for c in D['categorias']}
SCOPE={'base_tabla':'Tabla del curso','adicional_requerida':'Adicional del bloque exigido','complementaria':'Complementaria de fundamentos','contextual':'Ejemplo contextual'}

def refs(items):
    return ' · '.join(f'<a href="{SOURCES[r["fuente"]]["archivo"]}#page={r["pagina"]}" target="_blank" rel="noopener">{r["fuente"]}:{r["pagina"]}</a>' for r in items)

def lis(items):
    return '<ul>'+''.join(f'<li>{esc(i)}</li>' for i in items)+'</ul>'

rows=[]
for t in D['herramientas']:
    category = CATS[t['categoria_curso']]['nombre_original'] if t['categoria_curso'] else 'No indicada'
    price = D['modelos_precio_curso'].get(t['precio_curso'],'No indicado')
    source_text=' '.join(f'{r["fuente"]}:{r["pagina"]}' for r in t['referencias'])
    search=' '.join([t['id'],t['nombre'],' '.join(t['alias']),category,source_text])
    notes=''.join(f'<p>{esc(n)}</p>' for n in t['notas'])
    aliases=f'<p><strong>Otros nombres:</strong> {esc(", ".join(t["alias"]))}</p>' if t['alias'] else ''
    external=''.join(f'<p><a href="{esc(s["url"])}" target="_blank" rel="noopener">{esc(s["titulo"])}</a></p>' for s in D['fuentes_externas'] if s['id'] in t.get('referencias_externas',[]))
    detail=f'<details><summary>Fuentes y pendientes</summary><div class="detail"><p>{refs(t["referencias"])}</p>{aliases}{notes}{external}<p><strong>Por completar para la ficha:</strong></p>{lis(t["pendientes"])}</div></details>'
    rows.append(f'<tr data-scope="{t["alcance"]}" data-category="{t["categoria_curso"] or "none"}" data-search="{esc(search,quote=True)}"><td class="mono">{t["id"]}</td><td><strong>{esc(t["nombre"])}</strong><small>{SCOPE[t["alcance"]]}</small>{detail}</td><td>{esc(category)}</td><td>{esc(price)}<small>{esc(t["precio_curso"] or "—")}</small></td><td>{refs([r for r in t["referencias"] if r["tipo"]!="tabla_completa"] or t["referencias"][:1])}</td></tr>')

practice_html=[]
for p in D['practicas']:
    diagram=next(d for d in D['diagramas'] if d['id']==p['diagrama_id'])
    attrs=''.join(f'<p><strong>{label}:</strong> {esc("; ".join(p[field]))}</p>' for label,field in [('Roles','roles'),('Competencias','competencias'),('Productos de trabajo','productos_trabajo'),('Objetivos','objetivos')] if p[field])
    practice_html.append(f'<article class="practice" id="{p["id"]}"><div class="practice-heading"><span class="mono">{p["id"]}</span><h3>{esc(p["nombre_es"])}</h3></div><p class="muted">{esc(p["nombre_original"])}</p><p>{esc(p["descripcion"])}</p><p class="source">{refs(p["referencias"])}</p><details><summary>Ver actividades, elementos y diagrama</summary><div class="practice-detail"><div><h4>Actividades del diagrama</h4>{lis(p["actividades"])}{attrs}{f"<p>{esc(p['nota'])}</p>" if p.get('nota') else ""}</div><a href="{diagram["imagen"]}" target="_blank" rel="noopener"><img src="{diagram["imagen"]}" loading="lazy" alt="{esc(p["nombre_es"])}"></a></div></details></article>')

diagrams=''.join(f'<article class="diagram"><a href="{d["imagen"]}" target="_blank" rel="noopener"><img src="{d["imagen"]}" loading="lazy" alt="{esc(d["nombre"])}"></a><p class="mono">{d["id"]} · {esc(d["tipo"])}</p><h3>{esc(d["nombre"])}</h3><p class="source">{refs(d["referencias"])}</p><p>{esc(d["nota"])}</p></article>' for d in D['diagramas'])
topics=''.join(f'<li><strong>{esc(t["nombre"])}</strong> — {esc(t["nota"])} <span class="source">{refs(t["referencias"])}</span></li>' for t in D['temas_sin_diagrama_essence'])
non_essence=''.join(f'<li>{esc(g["nombre"])} · {esc(g["tipo"].replace("_"," "))} · {refs([g])}</li>' for g in D['graficos_no_essence'])
exclusions=''.join(f'<li><strong>{esc(t["nombre"])}:</strong> {esc(t["decision"])} {refs(t["referencias"])}</li>' for t in D['menciones_contextuales_y_exclusiones'])
sources=''.join(f'<li><a href="{s["archivo"]}" target="_blank" rel="noopener"><strong>{s["id"]}</strong> · {esc(s["nombre"])}</a><span class="muted"> · {s["numero_paginas"]} páginas</span></li>' for s in D['fuentes'])
external_sources=''.join(f'<li><a href="{esc(s["url"])}" target="_blank" rel="noopener">{esc(s["titulo"])}</a> — {esc(s["uso"])}</li>' for s in D['fuentes_externas'])
category_options=''.join(f'<option value="{k}">{esc(v["nombre_original"])}</option>' for k,v in CATS.items())

template='''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inventario del taller DevOps</title>
<style>
:root{color-scheme:light dark;--bg:#fafaf8;--text:#242923;--muted:#626c61;--line:#d4dcd0;--accent:#296444;--panel:#f0f4ee}
@media(prefers-color-scheme:dark){:root{--bg:#151a17;--text:#e7eee7;--muted:#aab9aa;--line:#3d493f;--accent:#91cda5;--panel:#202a23}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.55 system-ui,Segoe UI,sans-serif}main{max-width:1240px;margin:0 auto;padding:44px 32px 72px}h1{font-size:32px;line-height:1.2;max-width:800px;margin:8px 0 16px}h2{font-size:24px;margin:0 0 16px}h3{font-size:18px;margin:0 0 8px}h4{font-size:16px;margin:12px 0}p{margin:10px 0}a{color:var(--accent);text-underline-offset:3px}nav{display:flex;gap:20px;flex-wrap:wrap;padding:20px 0;border-bottom:1px solid var(--line)}section{padding-top:38px}.eyebrow{font-size:13px;letter-spacing:.08em;text-transform:uppercase}.muted,small{color:var(--muted)}small{display:block;font-size:12px;margin-top:4px}.mono{font-family:ui-monospace,Consolas,monospace;font-size:13px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin:26px 0}.metric{border-top:2px solid var(--accent);padding-top:12px}.metric b{display:block;font-size:30px;font-weight:600}.metric span{font-size:14px}.note{background:var(--panel);padding:16px 20px;border-left:3px solid var(--accent);margin:20px 0}.controls{display:flex;gap:12px;flex-wrap:wrap;margin:18px 0 10px}.controls label{display:flex;flex-direction:column;gap:5px;font-size:13px;flex:1;min-width:180px}input,select,button{font:inherit;color:var(--text);background:var(--bg);border:1px solid var(--line);border-radius:5px;padding:10px 12px;min-height:44px}input:focus,select:focus,summary:focus{outline:2px solid var(--accent);outline-offset:3px}.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;vertical-align:top;padding:13px 12px;border-bottom:1px solid var(--line)}th{font-size:12px;letter-spacing:.04em;text-transform:uppercase;background:var(--panel)}td:nth-child(1){width:62px}td:nth-child(2){width:39%}td:nth-child(3){width:19%}td:nth-child(4){width:13%}details{margin-top:8px}summary{cursor:pointer;color:var(--accent);font-size:14px}details[open] summary{margin-bottom:12px}.detail{font-size:13px;max-width:540px}.detail ul{padding-left:20px}.source{font-size:13px}.source a{white-space:nowrap}.practice{border-top:1px solid var(--line);padding:22px 0}.practice-heading{display:flex;align-items:baseline;gap:16px}.practice-detail{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:16px}.practice-detail img{width:100%;height:auto}.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:30px 24px}.diagram img{width:100%;height:auto;background:white}.diagram h3{font-size:16px}.diagram p{font-size:13px}.diagram{padding-bottom:20px;border-bottom:1px solid var(--line)}.long-list li{margin:12px 0}.sources li{margin:12px 0}footer{margin-top:40px;padding-top:20px;border-top:1px solid var(--line);font-size:13px}li{margin:6px 0}[hidden]{display:none!important}
@media(max-width:760px){main{padding:24px 18px 48px}h1{font-size:27px}.metrics{grid-template-columns:repeat(2,1fr)}.gallery{grid-template-columns:repeat(2,1fr)}.practice-detail{grid-template-columns:1fr}table{min-width:820px}}
@media(max-width:460px){.gallery{grid-template-columns:1fr}.controls label{min-width:100%}}
@media print{body{font-size:10pt;background:#fff;color:#111}main{padding:0}nav,.controls,.downloads{display:none}.metrics{grid-template-columns:repeat(4,1fr)}.table-wrap{overflow:visible}table{min-width:0;font-size:8pt}a{color:inherit}section{break-before:page}.practice,.diagram{break-inside:avoid}details:not([open])>div{display:block}tr[hidden]{display:table-row!important}}
</style></head><body><main>
<header><p class="eyebrow">Integración y Despliegue de Software · Paso 01 · 18 de noviembre de 2026</p><h1>Inventario del taller DevOps</h1><p>Herramientas, prácticas y diagramas del material del profesor, con referencias de página y decisiones de inclusión.</p><p class="muted">8 presentaciones · 105 páginas revisadas. Cada código Pxx:página abre la fuente correspondiente.</p>
<div class="metrics"><div class="metric"><b>144</b><span>Herramientas del bloque exigido</span></div><div class="metric"><b>14</b><span>Prácticas Essence nombradas</span></div><div class="metric"><b>19</b><span>Diagramas Essence distintos</span></div><div class="metric"><b>199</b><span>Registros, incluido contexto</span></div></div>
<p>Las 144 herramientas principales se componen de <strong>120 casillas de la tabla y 24 incorporaciones</strong>. Se conservan además 51 menciones complementarias y 4 servicios de ejemplo. Los 19 diagramas corresponden a 21 apariciones: dos se repiten.</p>
<div class="note"><strong>Alcance de esta entrega:</strong> inventario completo de elementos identificables y trazabilidad. Las descripciones comerciales, los archivos individuales de logos y las relaciones herramienta–práctica se completarán al preparar las fichas. “No indicado” significa que el material no aporta ese dato.</div>
<p class="downloads"><a href="inventario.json" download>Descargar inventario JSON</a> · <a href="herramientas.json" download>Herramientas</a> · <a href="practicas.json" download>Prácticas</a> · <a href="diagramas.json" download>Diagramas</a></p></header>
<nav aria-label="Secciones"><a href="#herramientas">Herramientas</a><a href="#practicas">Prácticas</a><a href="#diagramas">Diagramas</a><a href="#criterios">Criterios y pendientes</a><a href="#fuentes">Fuentes</a></nav>
<section id="herramientas"><h2>Herramientas</h2><p>La categoría y el modelo de precios se conservan tal como aparecen en clase. No representan una comprobación comercial actual. Los nombres históricos y los alias permanecen consultables.</p>
<div class="controls"><label>Buscar nombre, alias o referencia<input id="search" type="search" placeholder="Ej.: Playwright, uDeploy, P06F:8"></label><label>Alcance<select id="scope"><option value="required">Bloque exigido (144)</option><option value="all">Todos los registros (199)</option><option value="base_tabla">Tabla del curso (120)</option><option value="adicional_requerida">Adicionales exigidos (24)</option><option value="complementaria">Complementarios (51)</option><option value="contextual">Ejemplos contextuales (4)</option></select></label><label>Categoría<select id="category"><option value="all">Todas las categorías</option>__CATEGORY_OPTIONS__<option value="none">No indicada en la fuente</option></select></label></div>
<p id="result-count" class="muted" aria-live="polite"></p><div class="table-wrap"><table><thead><tr><th>ID</th><th>Herramienta / evidencia</th><th>Categoría del curso</th><th>Modelo del curso</th><th>Referencias destacadas</th></tr></thead><tbody id="tools-body">__TOOLS__</tbody></table></div></section>
<section id="practicas"><h2>Prácticas Essence</h2><p>Se incluyen las 14 prácticas con nombre dentro de un hexágono de práctica. Las descripciones en español sintetizan el diagrama; las actividades se conservan en el idioma original. Los cuatro ejemplos de Calidad de Software de P04 también se incluyen porque el enunciado pide todos los diagramas del curso.</p>__PRACTICES__</section>
<section id="diagramas"><h2>Diagramas Essence y material de apoyo</h2><p>14 diagramas de prácticas, 1 del proceso de pruebas y 4 del núcleo/notación. Integración continua aparece en P02:2 y P03:2; monitoreo continuo, en P02:5 y P06I:2. Cada miniatura abre la diapositiva completa.</p><div class="gallery">__DIAGRAMS__</div></section>
<section id="criterios"><h2>Criterios y decisiones</h2>__CRITERIA__<h3>Lo que falta para las fichas de la aplicación</h3>__PENDING__
<details><summary>Temas presentes sin diagrama Essence propio</summary><ul class="long-list">__TOPICS__</ul></details>
<details><summary>Gráficos que no deben contarse como diagramas Essence</summary><ul class="long-list">__NON_ESSENCE__</ul></details>
<details><summary>Marcas, ejemplos y elementos excluidos del catálogo principal</summary><ul class="long-list">__EXCLUSIONS__</ul></details></section>
<section id="fuentes"><h2>Fuentes verificables</h2><p>Se conserva una copia de cada PDF dentro de esta carpeta. El JSON registra también el nombre original, la ruta original, el número de páginas y SHA-256.</p><ol class="sources">__SOURCES__</ol><h3>Referencias externas de desambiguación</h3><p>Usadas únicamente para aclarar nombres y alias, sin sustituir la clasificación o los precios de las diapositivas.</p><ul>__EXTERNAL__</ul></section>
<footer>Inventario académico basado en las presentaciones entregadas. Los datos pendientes están marcados de forma explícita. No se ha creado el tablero de Trello ni la aplicación final.</footer>
</main><script>
const search=document.getElementById('search'),scope=document.getElementById('scope'),category=document.getElementById('category');
const rows=[...document.querySelectorAll('#tools-body tr')];
function norm(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function filterRows(){const q=norm(search.value.trim());let count=0;for(const row of rows){const scopeOK=scope.value==='all'||(scope.value==='required'?['base_tabla','adicional_requerida'].includes(row.dataset.scope):row.dataset.scope===scope.value);const catOK=category.value==='all'||row.dataset.category===category.value;const found=scopeOK&&catOK&&norm(row.dataset.search).includes(q);row.hidden=!found;if(found)count++}document.getElementById('result-count').textContent=count+' registros visibles';}
search.addEventListener('input',filterRows);scope.addEventListener('change',filterRows);category.addEventListener('change',filterRows);filterRows();
</script></body></html>'''
replacements={'__CATEGORY_OPTIONS__':category_options,'__TOOLS__':''.join(rows),'__PRACTICES__':''.join(practice_html),'__DIAGRAMS__':diagrams,'__CRITERIA__':lis(D['criterios']),'__PENDING__':lis(D['pendientes_generales']),'__TOPICS__':topics,'__NON_ESSENCE__':non_essence,'__EXCLUSIONS__':exclusions,'__SOURCES__':sources,'__EXTERNAL__':external_sources}
for key,value in replacements.items(): template=template.replace(key,value)
assert not re.search(r'__[A-Z_]+__',template), 'Unresolved HTML template marker'
(OUT/'inventario.html').write_text(template,encoding='utf-8')

with zipfile.ZipFile(ROOT/'inventario-devops.zip','w',zipfile.ZIP_DEFLATED) as z:
    for file in sorted(OUT.rglob('*')):
        if file.is_file(): z.write(file,file.relative_to(ROOT))
print('HTML and portable ZIP created.')
