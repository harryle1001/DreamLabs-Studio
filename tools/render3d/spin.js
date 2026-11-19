#!/usr/bin/env node
/* Dựng bộ khung xoay 360 cho một dòng sản phẩm 3D.
   node tools/render3d/spin.js <dòng> [--frames 48] [--n 8] [--size 1200] [--pre i,j,k] [--max 1800000] [--shot <mẫu mã>] [--v2 [--hi 1600] [--lo 960]] [--q k=v&k=v]
   → img/spin/<dòng>/001.webp…  (--pre: chỉ dựng vài khung PNG vào thư mục OUT để xem trước)
   Cần: playwright, sharp, three/examples/jsm (NODE_PATH hoặc biến DL_NPM trỏ tới node_modules chứa sharp và three). */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const NPM=process.env.DL_NPM||path.join(__dirname,'../../node_modules'),sharp=require(path.join(NPM,'sharp'));
const S=__dirname,ROOT=path.join(S,'../..'),JSM=path.join(NPM,'three/examples/jsm/');
const a=process.argv.slice(2),line=a[0];const opt=(k,d)=>{const i=a.indexOf('--'+k);return i>0?a[i+1]:d};
const N=+opt('frames',a.includes('--v2')?72:48),ns=+opt('n',8),size=+opt('size',a.includes('--v2')?1600:1200),pre=opt('pre',''),MAX=+opt('max',1800000),extra=opt('q','');
const V2=a.includes('--v2'),HI=+opt('hi',1600),LO=+opt('lo',960);
const shot=opt('shot',''),slug=shot?line+'-'+shot:line;   // --shot <mẫu mã> → img/spin/<dòng>-<mẫu mã>/
const OUT=process.env.DL_OUT||path.join(S,'out');fs.mkdirSync(path.join(OUT,slug),{recursive:true});
const MIME={js:'text/javascript',html:'text/html',json:'application/json',css:'text/css',woff2:'font/woff2'};
/* v2: khung RGBA nền trong suốt. img/spin/<slug>/bg.webp (ảnh nền), l/NNN.webp (LO px, đủ N khung), h/NNN.webp (HI px, khung lẻ 001, 003…), meta.json */
async function v2(p){
 const dst=path.join(ROOT,'img/spin',slug);for(const d of['l','h'])fs.mkdirSync(path.join(dst,d),{recursive:true});
 const info=await p.evaluate('window.__info'),buf=d=>Buffer.from(d.split(',')[1],'base64'),t0=Date.now();
 if(!fs.existsSync(path.join(dst,'bg.webp')))await sharp(buf(await p.evaluate(()=>window.__plate()))).resize(1200,1200).webp({quality:82,effort:6}).toFile(path.join(dst,'bg.webp'));
 for(let i=0;i<N;i++){const n=String(i+1).padStart(3,'0'),fl=path.join(dst,'l',n+'.webp'),fh=path.join(dst,'h',n+'.webp');
  if(fs.existsSync(fl)&&(i%2||fs.existsSync(fh)))continue;
  const png=buf(await p.evaluate(([i,N])=>window.__frame(i,N),[i,N]));
  if(i%2===0)await sharp(png).resize(HI,HI).webp({quality:84,alphaQuality:90,effort:6,smartSubsample:true}).toFile(fh);
  await sharp(png).resize(LO,LO,{kernel:'lanczos3'}).webp({quality:76,alphaQuality:85,effort:6,smartSubsample:true}).toFile(fl+'.tmp');fs.renameSync(fl+'.tmp',fl);
  console.log(slug,i+1+'/'+N,Math.round((Date.now()-t0)/1000)+'s')}
 fs.writeFileSync(path.join(dst,'meta.json'),JSON.stringify({v:2,frames:N,hiStep:2,lo:LO,hi:HI,ground:info.ground}));
 /* bộ khung kiểu cũ (NNN.webp nền liền) được giữ lại cho tới khi dữ liệu chuyển sang v2 */
 const sz=d=>fs.readdirSync(path.join(dst,d)).reduce((s,f)=>s+fs.statSync(path.join(dst,d,f)).size,0);
 console.log('GHI',slug,'v2',N,'khung · l',(sz('l')/1024|0)+'KB · h',(sz('h')/1024|0)+'KB · ground',JSON.stringify(info.ground))}
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:size,height:size}});
 p.on('pageerror',e=>console.log('PAGEERROR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('ERROR',m.text().slice(0,400))});
 await p.route('http://dl.local/**',rt=>{const u=decodeURIComponent(new URL(rt.request().url()).pathname);const f=u.startsWith('/__p/jsm/')?JSM+u.slice(9):u.startsWith('/__p/')?path.join(S,u.slice(5)):path.join(ROOT,u);if(!fs.existsSync(f))return rt.fulfill({status:404,body:'nf'});rt.fulfill({path:f,contentType:MIME[path.extname(f).slice(1)]||'application/octet-stream'})});
 await p.goto(`http://dl.local/__p/spin.html?w=${size}&h=${size}&n=${ns}${V2?'&v2=1':''}${extra?'&'+extra:''}${shot?'&shot='+shot:''}#${line}`);
 await p.waitForFunction('window.__done===true',null,{timeout:600000});
 const err=await p.evaluate('window.__err');if(err){console.log('ERR',err);await b.close();process.exit(1)}
 console.log((await p.evaluate('window.__kids')).join('\n'));console.log(JSON.stringify(await p.evaluate('window.__info')));
 if(V2&&!pre){await v2(p);await b.close();return}
 const list=pre?pre.split(',').map(Number):[...Array(N).keys()],t0=Date.now();
 for(const i of list){const f=path.join(OUT,slug,String(i+1).padStart(3,'0')+'.png');if(!pre&&fs.existsSync(f))continue;
  const d=await p.evaluate(([i,N])=>window.__frame(i,N),[i,N]);fs.writeFileSync(f,Buffer.from(d.split(',')[1],'base64'));
  console.log(slug,i+1+'/'+N,Math.round((Date.now()-t0)/1000)+'s')}
 await b.close();if(pre)return;
 /* nén: một mức chất lượng chung cho cả bộ, tổng ≤ MAX và mỗi khung ≤ 60KB */
 const dst=path.join(ROOT,'img/spin',slug);fs.mkdirSync(dst,{recursive:true});
 for(const q of[84,80,76,72,68,64,60,56,52,48,44,40]){let tot=0,big=0;const bufs=[];
  for(let i=0;i<N;i++){const o=await sharp(path.join(OUT,slug,String(i+1).padStart(3,'0')+'.png')).webp({quality:q,effort:6,smartSubsample:true}).toBuffer();bufs.push(o);tot+=o.length;big=Math.max(big,o.length)}
  if((tot<=MAX&&big<=60000)||q===40){bufs.forEach((o,i)=>fs.writeFileSync(path.join(dst,String(i+1).padStart(3,'0')+'.webp'),o));console.log('GHI',slug,N,'khung q'+q,(tot/1024).toFixed(0)+'KB, lớn nhất',(big/1024).toFixed(0)+'KB');break}}
})();
