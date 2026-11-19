from pathlib import Path
from html import escape
import json, re


def card_html(card):
    ident=card['id']
    scope='<h3>Alcance</h3><ul>'+''.join('<li>'+escape(s)+'</li>' for s in card['alcance'])+'</ul>' if card['alcance'] else ''
    criteria='<ul>'+''.join('<li>'+escape(s)+'</li>' for s in card['criterios_aceptacion'])+'</ul>'
    dependencies=', '.join(f'<a href="#{escape(d)}">{escape(d)}</a>' for d in card['dependencias']) or 'Ninguna'
    evidence=card.get('evidencia_desarrollo','')
    qa=card.get('prueba_testing','')
    return (
        f'<details class="card" id="{ident}" data-phase="{card["fase"]}"><summary><span>{ident} · Fase {card["fase"]} · {escape(card["lista_destino"])}</span><strong>{escape(card["titulo"])}</strong></summary>'
        f'<div class="body"><p><a data-trello="{ident}" href="{escape(card["trello"]["url"])}" target="_blank" rel="noopener">Abrir tarjeta en Trello</a></p>'
        f'<p><b>Responsable principal:</b> {escape(card["responsable_principal"])}</p><p>{escape(card["descripcion"])}</p>{scope}'
        f'<h3>Criterios de aceptación</h3>{criteria}<h3>Criterio de terminado</h3><p>{escape(card["criterio_terminado"])}</p>'
        f'<p><b>Dependencias:</b> {dependencies}</p><p><b>Origen:</b> {escape(card["origen"])}</p>'
        f'<p><b>Referencias:</b> {escape("; ".join(card["referencias"]) or "Matriz de requisitos del proyecto")}</p>'
        f'<section data-evidence="{ident}"><h3>Evidencia de desarrollo</h3><p>{escape(evidence)}</p></section>'
        +(f'<h3>Qué probar en Testing</h3><p>{escape(qa)}</p>' if qa else '')
        +'</div></details>'
    )


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
    list_name=ledger['listName']
    data.update(estado_publicacion='publicado_y_verificado',tablero_id=ledger['boardId'],lista_id=ledger['listId'],lista_destino=list_name,
        nota=f'Las 42 tarjetas se verificaron mediante el MCP de Trello. Lista actual: {list_name}. Responsable indicado en cada descripción. El envío académico a MinasLap sigue pendiente del estudiante.')
    for card in data['tarjetas']:
        actual=by_id[card['id']]
        card['trello'].update(id=actual['id'],idList=actual['listId'],url=actual['url'],name=actual['name'])
        card['lista_destino']=actual.get('listName',list_name)
        card['estado_publicacion']='publicado_y_verificado'
        for target,source in [('titulo','title'),('descripcion','plainDescription'),('criterios_aceptacion','acceptanceCriteria'),('prueba_testing','testPlan')]:
            if source in actual:card[target]=actual[source]
        if card['id'] in evidence:card['evidencia_desarrollo']=evidence[card['id']]
        if 'description' in actual:
            card['trello']['desc']=actual['description']
        elif card['id'] in evidence:
            card['trello']['desc']=card['trello']['desc'].split('\n\n**Evidencia de desarrollo')[0]+'\n\n**Evidencia de desarrollo (18/11/2026):**\n'+evidence[card['id']]
    (folder/'trello-backlog.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
    page=folder/'backlog.html'
    html=page.read_text(encoding='utf-8')
    summary=f'42 tarjetas publicadas y verificadas en {escape(list_name)}. <a href="{escape(ledger["boardURL"])}">Abrir tablero de Trello</a>. Cada tarjeta incluye responsable, criterios, evidencia y revisión. El envío a MinasLap sigue pendiente del estudiante.'
    html=re.sub(r'(<h1>El proyecto, tarea por tarea\.</h1>)<p>.*?</p>',lambda m:m.group(1)+'<p>'+summary+'</p>',html,count=1,flags=re.S)
    html=html.replace('<title>Backlog ·','<title>Planificación ·')
    for card in data['tarjetas']:
        pattern=rf'<details[^>]*id="{card["id"]}"[^>]*>.*?</details>'
        html,count=re.subn(pattern,lambda m:card_html(card),html,count=1,flags=re.S)
        assert count==1,card['id']
    page.write_text(html,encoding='utf-8',newline='\n')


if __name__=='__main__':sync_exports()
