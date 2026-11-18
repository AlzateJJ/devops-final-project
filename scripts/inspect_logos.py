from pathlib import Path
from PIL import Image,ImageDraw,ImageOps
root=Path(__file__).resolve().parents[1]
paths=[p for p in (root/'tmp/inventario/imagenes').iterdir() if p.stem in ['P03-18-0','P05-11-0','P06I-07-0','P06I-09-0','P06I-10-0','P06F-03-0','P06F-07-0','P06F-10-0','P06F-14-0']]
canvas=Image.new('RGB',(1500,350*((len(paths)+1)//2)),'#e4eaf1');draw=ImageDraw.Draw(canvas)
for i,p in enumerate(paths):
 im=Image.open(p).convert('RGB');im.thumbnail((730,315));x=(i%2)*750;y=(i//2)*350;canvas.paste(im,(x,y+28));draw.text((x+10,y+8),p.name,fill='black')
canvas.save(root/'tmp/inventario/logos-contact.png')
extras=[p for p in (root/'tmp/inventario/imagenes').iterdir() if any(p.name.startswith(s) for s in ['P05-12','P06I-08','P06I-11','P06F-08','P06F-11','P06F-15'])]
canvas=Image.new('RGB',(1400,180*((len(extras)+4)//5)),'#e4eaf1');draw=ImageDraw.Draw(canvas)
for i,p in enumerate(extras):
 im=Image.open(p).convert('RGB');im.thumbnail((270,145));x=(i%5)*280;y=(i//5)*180;canvas.paste(im,(x,y+28));draw.text((x+6,y+8),p.name,fill='black')
canvas.save(root/'tmp/inventario/logos-extras.png')
