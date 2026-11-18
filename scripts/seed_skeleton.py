from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
inv=json.loads((root/'inventario/inventario.json').read_text(encoding='utf-8'))
data={'version':1,'meta':{'name':'DevOps Atlas','author':'Juan José Alzate','contentVersion':'initial-skeleton'},
      'categories':[{'id':c['id'],'name':c['nombre_es']} for c in inv['categorias']],
      'prices':[{'id':k,'name':v} for k,v in inv['modelos_precio_curso'].items()]+[{'id':'NS','name':'No especificado en la fuente'}],
      'tools':[],'practices':[],'diagrams':[],'usages':[],
      'sources':[{'id':s['id'],'name':s['nombre'],'file':'../inventario/'+s['archivo']} for s in inv['fuentes']]}
(root/'app/data').mkdir(exist_ok=True)
(root/'app/data/database.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
