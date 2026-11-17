#!/usr/bin/env node
/* Dựng bộ khung xoay 360 cho một dòng sản phẩm 3D.
   node tools/render3d/spin.js <dòng> [--frames 48] [--n 8] [--size 1200] [--pre i,j,k] [--max 1800000] [--q k=v&k=v]
   → img/spin/<dòng>/001.webp…  (--pre: chỉ dựng vài khung PNG vào thư mục OUT để xem trước)
   Cần: playwright, sharp, three/examples/jsm (NODE_PATH hoặc biến DL_NPM trỏ tới node_modules chứa sharp và three). */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const NPM=process.env.DL_NPM||path.join(__dirname,'../../node_modules'),sharp=require(path.join(NPM,'sharp'));
const S=__dirname,ROOT=path.join(S,'../..'),JSM=path.join(NPM,'three/examples/jsm/');
const a=process.argv.slice(2),line=a[0];const opt=(k,d)=>{const i=a.indexOf('--'+k);return i>0?a[i+1]:d};
const N=+opt('frames',48),ns=+opt('n',8),size=+opt('size',1200),pre=opt('pre',''),MAX=+opt('max',1800000),extra=opt('q','');
const OUT=process.env.DL_OUT||path.join(S,'out');fs.mkdirSync(path.join(OUT,line),{recursive:true});
const MIME={js:'text/javascript',html:'text/html',json:'application/json',css:'text/css',woff2:'font/woff2'};
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:size,height:size}});
 p.on('pageerror',e=>console.log('PAGEERROR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('ERROR',m.text().slice(0,400))});
 await p.route('http://dl.local/**',rt=>{const u=decodeURIComponent(new URL(rt.request().url()).pathname);const f=u.startsWith('/__p/jsm/')?JSM+u.slice(9):u.startsWith('/__p/')?path.join(S,u.slice(5)):path.join(ROOT,u);if(!fs.existsSync(f))return rt.fulfill({status:404,body:'nf'});rt.fulfill({path:f,contentType:MIME[path.extname(f).slice(1)]||'application/octet-stream'})});
 await p.goto(`http://dl.local/__p/spin.html?w=${size}&h=${size}&n=${ns}${extra?'&'+extra:''}#${line}`);
 await p.waitForFunction('window.__done===true',null,{timeout:600000});
 const err=await p.evaluate('window.__err');if(err){console.log('ERR',err);await b.close();process.exit(1)}
 console.log((await p.evaluate('window.__kids')).join('\n'));console.log(JSON.stringify(await p.evaluate('window.__info')));
 const list=pre?pre.split(',').map(Number):[...Array(N).keys()],t0=Date.now();
 for(const i of list){const f=path.join(OUT,line,String(i+1).padStart(3,'0')+'.png');if(!pre&&fs.existsSync(f))continue;
  const d=await p.evaluate(([i,N])=>window.__frame(i,N),[i,N]);fs.writeFileSync(f,Buffer.from(d.split(',')[1],'base64'));
  console.log(line,i+1+'/'+N,Math.round((Date.now()-t0)/1000)+'s')}
 await b.close();if(pre)return;
 /* nén: một mức chất lượng chung cho cả bộ, tổng ≤ MAX và mỗi khung ≤ 60KB */
 const dst=path.join(ROOT,'img/spin',line);fs.mkdirSync(dst,{recursive:true});
 for(const q of[84,80,76,72,68,64,60,56,52,48,44,40]){let tot=0,big=0;const bufs=[];
  for(let i=0;i<N;i++){const o=await sharp(path.join(OUT,line,String(i+1).padStart(3,'0')+'.png')).webp({quality:q,effort:6,smartSubsample:true}).toBuffer();bufs.push(o);tot+=o.length;big=Math.max(big,o.length)}
  if((tot<=MAX&&big<=60000)||q===40){bufs.forEach((o,i)=>fs.writeFileSync(path.join(dst,String(i+1).padStart(3,'0')+'.webp'),o));console.log('GHI',line,N,'khung q'+q,(tot/1024).toFixed(0)+'KB, lớn nhất',(big/1024).toFixed(0)+'KB');break}}
})();
