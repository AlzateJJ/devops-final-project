from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
from pypdf import PdfReader
from concurrent.futures import ThreadPoolExecutor, as_completed
import io, json, urllib.request, re, sys
sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'app/assets/logos';OUT.mkdir(parents=True,exist_ok=True)
META={}
def extracted(source,page,index=0):
    return PdfReader(ROOT/f'inventario/fuentes/{source}.pdf').pages[page-1].images[index].image.convert('RGB')
def save(ident,image,source):
    image.thumbnail((320,240))
    target=OUT/f'{ident}.png';image.save(target)
    META[ident]={'file':f'assets/logos/{ident}.png','source':source}
def group(source,page,boxes):
    im=extracted(source,page);factor=min(1,730/im.width,315/im.height)
    for number,box in boxes:
        coords=tuple(round(v/factor) for v in box)
        save(f'H{number:03}',im.crop(coords),f'Logo extraído de {source}, página {page}, imagen de herramientas del curso.')

group('P03',18,[(1,(95,40,187,110)),(3,(238,40,330,110)),(11,(384,40,477,110)),(19,(525,40,617,110)),(37,(95,143,187,212)),(55,(238,143,330,212)),(73,(384,143,477,212)),(74,(525,143,617,212))])
group('P05',11,[(n,(x,y,x+73,y+52)) for row,nums in enumerate([[23,24,25,26],[41,42,43,44],[59,60,61,62],[77,78,79,80]]) for col,n in enumerate(nums) for x,y in [(160+103*col,6+80*row)]])
group('P06F',3,[(n,(x,y,x+97,y+73)) for row,nums in enumerate([[6,7,8,9],[15,16,17,34],[35,53,71,89]]) for col,n in enumerate(nums) for x,y in [(175+132*col,7+108*row)]])
group('P06F',7,[(n,(x,y,x+96,y+74)) for row,nums in enumerate([[21,22,39,40],[57,58,75,76]]) for col,n in enumerate(nums) for x,y in [(108+150*col,12+128*row)]])
group('P06F',10,[(13,(164,12,258,80)),(31,(293,12,387,80)),(49,(418,12,512,80)),(50,(547,12,641,80)),(67,(164,116,258,184)),(68,(293,116,387,184)),(69,(418,116,512,184)),(85,(547,116,641,184)),(86,(228,225,321,292)),(87,(357,225,450,292)),(88,(484,225,577,292))])
group('P06F',14,[(n,(x,y,x+100,y+75)) for row,nums in enumerate([[27,28,45,46],[63,64,81,82]]) for col,n in enumerate(nums) for x,y in [(138+141*col,16+136*row)]])
group('P06I',7,[(98,(19,116,204,251)),(99,(274,116,459,251)),(100,(530,116,713,251))])
group('P06I',9,[(2,(80,30,181,106)),(10,(224,30,325,106)),(18,(365,30,465,106)),(36,(502,30,604,106)),(54,(149,166,252,242)),(72,(294,166,395,242)),(90,(434,166,536,242))])
group('P06I',10,[(n,(x,74,x+86,137)) for n,x in zip(range(91,98),[0,107,214,320,427,534,640])])
for number,source,page,index in [(121,'P05',12,0),(122,'P05',12,4),(123,'P05',12,3),(124,'P05',12,2),(125,'P05',12,5),(126,'P05',12,1),(127,'P05',12,6),(128,'P06I',8,1),(129,'P06I',8,0),(130,'P06I',11,2),(131,'P06I',11,1),(132,'P06I',11,0),(133,'P06F',8,5),(134,'P06F',8,0),(135,'P06F',8,1),(136,'P06F',8,2),(137,'P06F',8,3),(138,'P06F',8,6),(139,'P06F',8,4),(140,'P06F',11,0),(141,'P06F',11,1),(142,'P06F',15,3),(143,'P06F',15,4),(144,'P06F',15,0),(83,'P06F',15,2)]:
    save(f'H{number:03}',extracted(source,page,index),f'Imagen de la herramienta extraída de {source}, página {page}.')

# Los productos de un proveedor comparten su marca cuando la lámina no aporta logo individual.
for number,parent,brand in [(5,16,'AWS'),(84,16,'AWS'),(52,53,'IBM')]:
    save(f'H{number:03}',Image.open(OUT/f'H{parent:03}.png'),f'Marca del proveedor {brand}, extraída de P06F:3; no es un logo específico del producto.')

icons={4:'flyway',20:'redgate',51:'spinnaker',65:'gocd',66:'octopusdeploy',102:'vault',103:'sonarqube',107:'opsgenie',109:'jira',110:'trello',112:'atlassian',113:'pagerduty',114:'slack'}
orgs={20:'red-gate',12:'delphix',14:'Plutora',29:'Broadcom',30:'elasticbox',32:'Broadcom',33:'OpenMake-Software',38:'Datical',47:'electric-cloud',48:'xebialabs',56:'dbmaestro',70:'xebialabs',101:'fortify',104:'blackducksoftware',105:'cyberark',106:'ServiceNow',108:'versionone',111:'rallytools',115:'bmcsoftware',116:'Tripwire',117:'signalsciences',118:'veracode',119:'snort3',120:'Checkmarx'}
def request(url):
    req=urllib.request.Request(url,headers={'User-Agent':'DevOpsAtlas-Academic/1.0'})
    with urllib.request.urlopen(req,timeout=20) as r:return r.read(2_000_000),r.geturl()
def fetch(number):
    ident=f'H{number:03}'
    candidates=[]
    if number in icons:
        slug=icons[number]
        candidates=[(f'https://cdn.jsdelivr.net/npm/simple-icons@5.24.0/icons/{slug}.svg','svg'),(f'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/{slug}.svg','svg')]
    if number in orgs:candidates.append((f'https://github.com/{orgs[number]}.png?size=256','png'))
    for url,ext in candidates:
        try:
            data,final=request(url)
            if ext=='svg':
                s=data.decode('utf-8');
                if '<svg' not in s or '<script' in s:continue
                (OUT/f'{ident}.svg').write_text(s,encoding='utf-8')
                return ident,{'file':f'assets/logos/{ident}.svg','source':f'Marca distribuida por Simple Icons: {url}. Referencia visual, no evidencia de precio.'}
            im=Image.open(io.BytesIO(data)).convert('RGB');im.thumbnail((256,256));im.save(OUT/f'{ident}.png')
            return ident,{'file':f'assets/logos/{ident}.png','source':f'Marca de la organización/proveedor en GitHub: {url}. Puede diferir del logo histórico de la tabla.'}
        except Exception:pass
    return ident,None
missing=[n for n in range(1,145) if f'H{n:03}' not in META]
old_path=ROOT/'app/data/logo-sources.json'
old=json.loads(old_path.read_text(encoding='utf-8')) if old_path.exists() else {}
pending=[]
for n in missing:
    k=f'H{n:03}'
    if k in old and (ROOT/'app'/old[k]['file']).exists():META[k]=old[k]
    else:pending.append(n)
with ThreadPoolExecutor(max_workers=8) as pool:
    for future in as_completed([pool.submit(fetch,n) for n in pending]):
        ident,record=future.result()
        if record:META[ident]=record
        print(ident,'ok' if record else 'pendiente',flush=True)
dbmaestro_logo='https://urbancode.github.io/IBM-UCx-PLUGIN-DOCS/assets/logo-300x74.CE_Dp3n1.png'
if META.get('H056',{}).get('source')!=dbmaestro_logo:
    data,_=request(dbmaestro_logo)
    logo=Image.open(io.BytesIO(data)).convert('RGBA')
    white=Image.new('RGBA',logo.size,'white');white.alpha_composite(logo)
    save('H056',white.convert('RGB'),dbmaestro_logo)
old_path.write_text(json.dumps(META,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'logos':len(META),'pendientes':[f'H{n:03}' for n in range(1,145) if f'H{n:03}' not in META]},ensure_ascii=False))
