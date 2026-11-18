const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-1425-0_26.1117.1425.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});const page=await browser.newPage({viewport:{width:1280,height:1100}});await page.goto('http://127.0.0.1:8765/app/');const db=JSON.parse(fs.readFileSync(path.join(root,'app/data/database.json'),'utf8'));
for(let part=0;part<2;part++){
 await page.evaluate(({tools,part})=>{document.body.innerHTML='<main style="padding:10px;margin:0;font:13px system-ui;display:grid;grid-template-columns:repeat(8,1fr);gap:10px">'+tools.slice(part*72,(part+1)*72).map(t=>'<div style="border:1px solid #ddd;background:#fff;padding:8px;text-align:center"><img style="width:110px;height:85px;object-fit:contain" src="'+t.logo+'"><br>'+t.id+' '+t.name+'</div>').join('')+'</main>'},{tools:db.tools,part});
 await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
 const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.naturalWidth).map(i=>i.src));if(broken.length)throw Error('Broken images '+broken);
 await page.screenshot({path:path.join(root,`tmp/inventario/assets-${part+1}.png`),fullPage:true});
}
 await browser.close();console.log('144 logos decoded in Chromium');})().catch(e=>{console.error(e);process.exit(1)});
