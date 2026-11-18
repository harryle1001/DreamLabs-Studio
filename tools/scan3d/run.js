#!/usr/bin/env node
/* Dựng ảnh / xoay 360 / phim từ mô hình quét vật thật (tools/scan3d/models, tải bằng fetch.py).
   DL_NPM=/tmp/dl/node_modules node tools/scan3d/run.js still <id>     → img/sm-product-scan-<slug>.webp (1280×791)
   DL_NPM=… node tools/scan3d/run.js spin <id> [số khung=48]            → img/spin/scan-<slug>/001.webp…
   DL_NPM=… node tools/scan3d/run.js film                              → media/sm-motion-studio3d.mp4 + ảnh poster/bìa
   DL_NPM=… node tools/scan3d/run.js pre <id>                          → vài khung PNG xem trước trong tools/scan3d/out/
   Cần Playwright (Chromium, swiftshader), sharp, three (examples/jsm), ffmpeg. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const NPM=process.env.DL_NPM||path.join(__dirname,'../../node_modules'),sharp=require(path.join(NPM,'sharp'));
const S=__dirname,ROOT=path.join(S,'../..'),JSM=path.join(NPM,'three/examples/jsm/'),OUT=path.join(S,'out');
const [mode,id,nArg]=process.argv.slice(2),P=JSON.parse(fs.readFileSync(path.join(S,'products.json'),'utf8'));
const MIME={js:'text/javascript',html:'text/html',json:'application/json',css:'text/css',woff2:'font/woff2',gltf:'model/gltf+json',bin:'application/octet-stream',jpg:'image/jpeg',png:'image/png'};
async function open(q,w,h){
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage({viewport:{width:w,height:h}});
  p.on('pageerror',e=>console.log('PAGEERROR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('ERROR',m.text().slice(0,300))});
  await p.route('http://dl.local/**',rt=>{const u=decodeURIComponent(new URL(rt.request().url()).pathname);
    if(u.endsWith('/__list')){const d=path.join(S,u.slice(5,-7));return rt.fulfill({contentType:'application/json',body:JSON.stringify(fs.existsSync(d)?fs.readdirSync(d):[])})}
    const f=u.startsWith('/__p/jsm/')?JSM+u.slice(9):u.startsWith('/__p/')?path.join(S,u.slice(5)):path.join(ROOT,u);
    if(!fs.existsSync(f))return rt.fulfill({status:404,body:'nf'});rt.fulfill({path:f,contentType:MIME[path.extname(f).slice(1)]||'application/octet-stream'})});
  await p.goto(`http://dl.local/__p/studio.html?w=${w}&h=${h}&${q}`);
  await p.waitForFunction('window.__done===true',null,{timeout:600000});
  const err=await p.evaluate('window.__err');if(err){console.log('ERR',err);await b.close();process.exit(1)}
  return {b,p}}
const png=d=>Buffer.from(d.split(',')[1],'base64');
const prod=()=>{const p=P.find(x=>x.id===id||x.slug===id);if(!p){console.log('Không có mẫu',id);process.exit(1)}return p};
(async()=>{
 if(mode==='pre'){const p=prod(),d=path.join(OUT,'pre');fs.mkdirSync(d,{recursive:true});
  let {b,p:pg}=await open('mode=spin&id='+p.id,800,800);for(const i of[0,12,24,36])fs.writeFileSync(path.join(d,`${p.slug}-${i}.png`),png(await pg.evaluate(i=>window.__spin(i,48),i)));await b.close();
  ({b,p:pg}=await open('mode=still&id='+p.id,1280,791));fs.writeFileSync(path.join(d,`${p.slug}-still.png`),png(await pg.evaluate('window.__still()')));await b.close();console.log('xem',d);return}
 if(mode==='still'){const p=prod(),{b,p:pg}=await open('mode=still&id='+p.id,1280,791);
  const f=path.join(ROOT,`img/sm-product-scan-${p.slug}.webp`);await sharp(png(await pg.evaluate('window.__still()'))).webp({quality:82,effort:6}).toFile(f);await b.close();console.log('GHI',f);return}
 if(mode==='spin'){const p=prod(),N=+nArg||48,tmp=path.join(OUT,'spin',p.slug);fs.mkdirSync(tmp,{recursive:true});
  const {b,p:pg}=await open('mode=spin&id='+p.id,1200,1200),t0=Date.now();
  for(let i=0;i<N;i++){const f=path.join(tmp,String(i+1).padStart(3,'0')+'.png');if(fs.existsSync(f))continue;fs.writeFileSync(f,png(await pg.evaluate(([i,N])=>window.__spin(i,N),[i,N])));if(i%8===0)console.log(p.slug,i+1+'/'+N,Math.round((Date.now()-t0)/1000)+'s')}
  await b.close();const dst=path.join(ROOT,'img/spin','scan-'+p.slug);fs.mkdirSync(dst,{recursive:true});
  for(const q of[80,76,72,68,64,60,56,52,48]){let tot=0,big=0;const bufs=[];
   for(let i=0;i<N;i++){const o=await sharp(path.join(tmp,String(i+1).padStart(3,'0')+'.png')).webp({quality:q,effort:6,smartSubsample:true}).toBuffer();bufs.push(o);tot+=o.length;big=Math.max(big,o.length)}
   if((tot<=1800000&&big<=60000)||q===48){bufs.forEach((o,i)=>fs.writeFileSync(path.join(dst,String(i+1).padStart(3,'0')+'.webp'),o));console.log('GHI',dst,N,'khung q'+q,(tot/1024).toFixed(0)+'KB');break}}
  return}
 if(mode==='film'){const d=path.join(OUT,'film');fs.mkdirSync(d,{recursive:true});const {b,p:pg}=await open('mode=film',1920,1080),FR=await pg.evaluate('window.__FR'),t0=Date.now();
  for(let f=0;f<FR;f++){const o=path.join(d,String(f).padStart(5,'0')+'.png');if(fs.existsSync(o))continue;await pg.evaluate(f=>window.__film(f),f);await pg.screenshot({path:o});
   if(f%30===0)console.log('film',f+'/'+FR,Math.round((Date.now()-t0)/1000)+'s')}
  await b.close();const mp4=path.join(ROOT,'media/sm-motion-studio3d.mp4');
  execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',path.join(d,'%05d.png'),'-vf','scale=1280:720:flags=lanczos,format=yuv420p','-c:v','libx264','-preset','slow','-crf','23','-movflags','+faststart',mp4]);
  const pick=n=>path.join(d,String(n).padStart(5,'0')+'.png');
  await sharp(pick(54+66*0+40)).resize(1280,720).webp({quality:80}).toFile(path.join(ROOT,'media/sm-motion-studio3d.webp'));
  await sharp(pick(54+66*1+40)).resize(1280,791,{fit:'cover'}).webp({quality:80}).toFile(path.join(ROOT,'img/sm-motion-studio3d.webp'));
  console.log('GHI',mp4,(fs.statSync(mp4).size/1024).toFixed(0)+'KB');return}
 console.log('Lệnh: pre | still | spin | film');
})();
