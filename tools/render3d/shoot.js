// node shoot.js [--fast N] [--pre] line/shot[:outname] ...   → out/<line>-<shot>.png (xem trước) và, nếu không --pre, img/sm-product-<line>-<shot>.webp
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const sharp=require('/tmp/claude-0/-home-user/2c805972-97eb-57ae-8841-14adfe365124/scratchpad/npm/node_modules/sharp');
const S=__dirname,IMG='/home/user/dreamlab/img',JSM='/tmp/claude-0/-home-user/2c805972-97eb-57ae-8841-14adfe365124/scratchpad/npm/node_modules/three/examples/jsm/';
const args=process.argv.slice(2);let fast=0,pre=false,max=60000;const shots=[];
for(let i=0;i<args.length;i++){if(args[i]==='--fast')fast=+args[++i];else if(args[i]==='--pre')pre=true;else if(args[i]==='--max')max=+args[++i];else shots.push(args[i])}
const MIME={js:'text/javascript',html:'text/html',json:'application/json'};
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 for(const s of shots){const [line,shot]=s.split('/');const p=await b.newPage({viewport:{width:1600,height:989}});
  p.on('pageerror',e=>console.log('PAGEERROR',e.message));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.log(m.type().toUpperCase(),m.text().slice(0,400))});
  await p.route('**/__p/**',rt=>{const u=new URL(rt.request().url()).pathname.replace('/__p/','');const f=u.startsWith('jsm/')?JSM+u.slice(4):path.join(S,u);if(!fs.existsSync(f))return rt.fulfill({status:404,body:'nf'});rt.fulfill({path:f,contentType:MIME[path.extname(f).slice(1)]||'application/octet-stream'})});
  await p.goto(`http://127.0.0.1:4204/__p/render.html${fast?'?fast='+fast:''}#${line}/${shot}`);
  await p.waitForFunction('window.__done===true',null,{timeout:600000});
  const err=await p.evaluate('window.__err');if(err){console.log('ERR',s,err);await p.close();continue}
  const ms=await p.evaluate('window.__ms');const data=await p.evaluate(()=>document.getElementById('out').toDataURL('image/png'));await p.close();
  const buf=Buffer.from(data.split(',')[1],'base64');
  const small=await sharp(buf).resize(1280,791,{kernel:'lanczos3'}).png().toBuffer();fs.writeFileSync(`${S}/out/${line}-${shot}.png`,small);
  let size=0,q=0;
  if(!pre){for(q of[90,86,82,78,74,70,66,62,58,54,50,46,42]){const o=await sharp(small).webp({quality:q,effort:6,smartSubsample:true}).toBuffer();size=o.length;if(size<=max||q===42){fs.writeFileSync(`${IMG}/sm-product-${line}-${shot}.webp`,o);break}}}
  console.log(s,ms+'ms',pre?'preview':`q${q} ${size}B`)}
 await b.close()})();
