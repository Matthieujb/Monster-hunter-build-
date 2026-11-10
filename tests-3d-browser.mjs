import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
try{
 await mkdir('artifacts',{recursive:true});
 browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let ready=false;for(let i=0;i<30;i++){try{const r=await page.goto('http://127.0.0.1:8765/builder.html',{waitUntil:'domcontentloaded',timeout:2500});if(r?.ok()){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,300))}
 assert.ok(ready,'Serveur local indisponible');
 await page.waitForFunction(()=>document.querySelector('#hunter3dStatus')?.textContent?.includes('Glisser')||document.querySelector('#hunter3dStatus')?.textContent?.includes('Mode 2D'),{timeout:20000});
 await page.screenshot({path:'artifacts/chasseur-iphone.png',fullPage:true});
 const state=await page.evaluate(()=>({status:document.querySelector('#hunter3dStatus')?.textContent,canvas:!!document.querySelector('#hunter3d canvas'),fallback:!document.querySelector('#hunterFallback')?.hidden}));
 console.log('État 3D :',JSON.stringify(state));
 assert.ok(state.canvas,'Le canvas WebGL 3D est absent : '+state.status);
 assert.ok(!state.fallback,'Le mode 2D a remplacé le rendu 3D : '+state.status);
 const canvas=page.locator('#hunter3d canvas');const box=await canvas.boundingBox();assert.ok(box&&box.width>100&&box.height>100,'Canvas trop petit');
 await page.mouse.move(box.x+box.width*.3,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.75,box.y+box.height*.5,{steps:8});await page.mouse.up();
 await page.locator('#hunterZoomIn').click();await page.locator('#hunterZoomOut').click();await page.locator('#hunterReset').click();
 await page.screenshot({path:'artifacts/chasseur-apres-interaction.png',fullPage:true});
 assert.deepEqual(errors,[],'Erreurs JavaScript détectées');
 console.log('PASS : rendu WebGL, rotation, commandes de zoom et recentrage');
}finally{await browser?.close();server.kill()}
