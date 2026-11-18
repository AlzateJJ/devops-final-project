from pathlib import Path
from html import escape
import json, re

def sync_exports():
    root=Path(__file__).resolve().parents[1]
    folder=root/'planificacion'
    ledger=json.loads((folder/'trello-publicacion.json').read_text(encoding='utf-8'))
    if ledger.get('status')!='verified':return
    data=json.loads((folder/'trello-backlog.json').read_text(encoding='utf-8'))
    by_id={c['planningId']:c for c in ledger['cards']}
    evidence_path=folder/'evidencias-desarrollo.json'
    evidence={r['id']:r['evidencia'] for r in json.loads(evidence_path.read_text(encoding='utf-8'))} if evidence_path.exists() else {}
    assert len(by_id)==len(data['tarjetas'])==42
    data.update(estado_publicacion='publicado_y_verificado',tablero_id=ledger['boardId'],lista_id=ledger['listId'],
        nota='Las 42 tarjetas se crearon mediante el MCP de Trello y se verificaron por lectura. El responsable figura en la descripción; no se asignó un miembro nativo.')
    for c in data['tarjetas']:
        actual=by_id[c['id']]
        c['trello'].update(id=actual['id'],idList=actual['listId'],url=actual['url'])
        c['estado_publicacion']='publicado_y_verificado'
        if c['id'] in evidence:
            c['evidencia_desarrollo']=evidence[c['id']]
            c['trello']['desc']=c['trello']['desc'].split('\n\n**Evidencia de desarrollo')[0]+'\n\n**Evidencia de desarrollo (18/11/2026):**\n'+evidence[c['id']]
    (folder/'trello-backlog.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
    p=folder/'backlog.html';s=p.read_text(encoding='utf-8')
    s=s.replace('Contenido preparado para el Backlog de','42 tarjetas publicadas y verificadas en el Backlog de')
    s=s.replace('El estado de carga real se registra en el JSON; esta vista no acredita publicación en Trello.','Los enlaces de cada tarjeta abren su registro real en Trello. Se conserva la lista Backlog solicitada por el responsable.')
    for ident,c in by_id.items():
        marker=f'data-trello="{ident}"'
        if marker in s:continue
        pattern=f'(<details[^>]*id="{ident}"[^>]*>.*?</summary><div class="body">)'
        s=re.sub(pattern,lambda m:m.group(1)+f'<p><a {marker} href="{escape(c["url"])}" target="_blank" rel="noopener">Abrir tarjeta en Trello</a></p>',s,count=1,flags=re.S)
    for ident,description in evidence.items():
        if f'data-evidence="{ident}"' in s:continue
        pattern=f'(<details[^>]*id="{ident}"[^>]*>.*?)(</div></details>)'
        s=re.sub(pattern,lambda m:m.group(1)+f'<section data-evidence="{ident}"><h3>Evidencia de desarrollo</h3><p>{escape(description)}</p></section>'+m.group(2),s,count=1,flags=re.S)
    p.write_text(s,encoding='utf-8',newline='\n')

if __name__=='__main__':sync_exports()
