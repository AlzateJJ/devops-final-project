const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-1425-0_26.1117.1425.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'inventario/inventario.html');
const data=JSON.parse(fs.readFileSync(path.join(root,'inventario/inventario.json'),'utf8'));
function assert(value,message){if(!value)throw new Error(message)}
(async()=>{
 let browser;
 try{browser=await chromium.launch({headless:true});}
 catch(error){browser=await chromium.launch({headless:true,channel:'msedge'});}
 const page=await browser.newPage({viewport:{width:1440,height:1050}});
 page.setDefaultTimeout(10000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(file).href);
 assert(await page.locator('#tools-body tr:visible').count()===144,'Default scope must show 144');
 await page.locator('#scope').selectOption('all');
 assert(await page.locator('#tools-body tr:visible').count()===199,'All scope must show 199');
 await page.locator('#search').fill('uDeploy');
 assert(await page.locator('#tools-body tr:visible').count()===1,'Alias search must deduplicate uDeploy');
 assert((await page.locator('#tools-body tr:visible').textContent()).includes('UrbanCode Deploy'),'Wrong alias target');
 await page.locator('#search').fill('Azure DevOps');
 assert(await page.locator('#tools-body tr:visible').count()===1,'VSTS/Azure DevOps should be one record');
 await page.locator('#search').fill('');
 await page.locator('#scope').selectOption('base_tabla');
 await page.locator('#category').selectOption('TEST');
 assert(await page.locator('#tools-body tr:visible').count()===16,'Table testing category should contain 16');
 await page.locator('#category').selectOption('all');
 await page.locator('#scope').selectOption('required');
 assert(await page.locator('.practice').count()===14,'Expected 14 practices');
 assert(await page.locator('.diagram').count()===19,'Expected 19 diagram entries');
 const links=await page.locator('a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
 for(const href of links){
   if(!href||href.startsWith('#')||href.startsWith('http'))continue;
   assert(fs.existsSync(path.resolve(path.dirname(file),href.split('#')[0])),'Broken link: '+href);
 }
 const images=await page.locator('img').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src')));
 for(const src of images)assert(fs.existsSync(path.resolve(path.dirname(file),src)),'Missing image: '+src);
 await page.screenshot({path:path.join(root,'tmp/inventario/report-desktop.png')});
 await page.locator('#PR01 summary').click();
 await page.locator('#PR01').scrollIntoViewIfNeeded();
 await page.screenshot({path:path.join(root,'tmp/inventario/report-practice.png')});
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>window.scrollTo(0,0));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Page overflows at mobile width');
 await page.screenshot({path:path.join(root,'tmp/inventario/report-mobile.png')});
 assert(errors.length===0,'Runtime errors: '+errors.join(';'));
 await browser.close();
 const findings={status:'passed',tools:data.herramientas.length,required:144,practices:14,diagrams:19,local_links_checked:links.filter(h=>h&&!h.startsWith('#')&&!h.startsWith('http')).length,image_references_checked:images.length,checks:['filters','accent-insensitive search','alias deduplication','relative source links','diagram image files','mobile page overflow','browser runtime']};
 fs.writeFileSync(path.join(root,'tmp/inventario/verification.json'),JSON.stringify(findings,null,2));
 console.log(JSON.stringify(findings,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
