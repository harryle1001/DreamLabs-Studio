#!/usr/bin/env node
/* reel3 — xuất phim mẫu dựng từ ảnh / clip thật. Cần server:  node serve.js 4205
   node tools/reel3/render.js <tên phim> [bước]
     bước > 1 : chụp thưa, ghép bảng khung hình <SCR>/shots/<tên>-sheet.jpg để xem thử
     bước = 1 : chụp đủ khung -> media/sm-<tên>.mp4 (H.264 yuv420p, faststart, ≤ MAXKB) + media/sm-<tên>.webp (poster)
                + img/sm-<tên>.webp (ảnh bìa 1280×791) + với video-*: img/sm-<tên>-before.webp (cùng khung poster, bản ?raw)
   Nguồn ảnh/clip gốc nằm ở tools/reel3/_assets (không commit; danh sách ở tools/reel3/CREDITS.md, dựng lại bằng prep.py).
   Biến môi trường: PORT, SCR (thư mục tạm chứa khung hình), CRF, MAXKB, REUSE=1 (chỉ xuất lại poster / ảnh bìa / before từ khung đã chụp) */
const {chromium}=require('playwright'),{execFileSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const [name,stepArg='1']=process.argv.slice(2),step=+stepArg||1;
if(!name){console.error('thiếu tên phim');process.exit(1)}
const ROOT=path.join(__dirname,'../..'),PORT=process.env.PORT||4205,SCR=process.env.SCR||path.join(os.tmpdir(),'reel3');
const dir=path.join(SCR,'frames',name+(step>1?'-s':'')),shots=path.join(SCR,'shots');
const MAXKB=+process.env.MAXKB||2600,ff=a=>execFileSync('ffmpeg',['-y','-loglevel','error',...a]);
const kb=f=>fs.statSync(f).size/1024,pad=n=>String(n).padStart(4,'0');
(async()=>{
  const REUSE=process.env.REUSE==='1'&&step===1;   /* REUSE=1: dùng lại khung đã chụp, chỉ xuất lại poster / ảnh bìa / before (giữ nguyên mp4) */
  if(!REUSE)fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(shots,{recursive:true});
  const b=await chromium.launch({args:['--force-color-profile=srgb']});
  const open=async q=>{const p=await b.newPage({viewport:{width:1280,height:1280},deviceScaleFactor:1});
    const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
    await p.goto(`http://127.0.0.1:${PORT}/tools/reel3/film.html?n=${name}${q}`,{waitUntil:'load'});
    await p.waitForFunction(()=>window.__ready===true,null,{timeout:180000});
    const info=await p.evaluate(()=>window.__info);await p.setViewportSize({width:info.W,height:info.H});return {p,info,errs}};
  const seek=(p,t)=>p.evaluate(t=>window.__seek(t),t);
  const {p,info,errs}=await open('');console.log(name,JSON.stringify(info),errs.length?errs:'');
  const t0=Date.now();let n=0;
  if(!REUSE)for(let i=0;i<info.frames;i+=step){await seek(p,i/info.fps);await p.screenshot({path:path.join(dir,`f${pad(step>1?n:i)}.png`),type:'png'});n++;
    if(n%60===0)console.log(' ',n,'khung',((Date.now()-t0)/1000).toFixed(0)+'s')}
  if(errs.length)console.log('LỖI',errs);
  if(step>1){const cols=info.W>info.H?4:info.W===info.H?6:8,cw=info.W>info.H?480:info.W===info.H?300:220,out=path.join(shots,name+'-sheet.jpg');
    ff(['-framerate','1','-i',path.join(dir,'f%04d.png'),'-vf',`scale=${cw}:-1,tile=${cols}x${Math.ceil(n/cols)}:padding=4:color=0x333333`,'-frames:v','1','-q:v','3',out]);console.log('sheet',out);await b.close();return}
  const out=path.join(ROOT,'media',`sm-${name}.mp4`);let crf=+process.env.CRF||20;
  if(!REUSE)for(;;crf++){ff(['-framerate',String(info.fps),'-i',path.join(dir,'f%04d.png'),'-c:v','libx264','-profile:v','high','-pix_fmt','yuv420p','-crf',String(crf),'-preset','slower','-x264-params','aq-mode=3','-movflags','+faststart','-an',out]);
    if(kb(out)<=MAXKB||crf>=34)break;crf+=Math.max(0,Math.ceil(6*Math.log2(kb(out)/MAXKB))-1)}
  const pf=Math.min(info.frames-1,Math.round(info.poster*info.fps)),pPng=path.join(dir,`f${pad(pf)}.png`),poster=path.join(ROOT,'media',`sm-${name}.webp`);
  ff(['-i',pPng,'-c:v','libwebp','-quality','82','-compression_level','6',poster]);
  let before=null;
  if(name.startsWith('video-')){const r=await open('&raw');await seek(r.p,pf/info.fps);const bp=path.join(dir,'before.png');await r.p.screenshot({path:bp});await r.p.close();
    before=path.join(ROOT,'img',`sm-${name}-before.webp`);ff(['-i',bp,'-c:v','libwebp','-quality','82','-compression_level','6',before])}
  /* ảnh bìa 1280×791: khung hình hoàn chỉnh đặt trên nền mờ của chính nó */
  const ratio=info.W>info.H?'16:9':info.W<info.H?'9:16':'1:1';
  const ct=info.cover||(ratio==='16:9'?[info.poster]:ratio==='9:16'?[info.duration*.3,info.poster,info.duration*.86]:[info.duration*.35,info.poster]);
  const cf=ct.map(t=>'file://'+path.join(dir,`f${pad(Math.min(info.frames-1,Math.round(t*info.fps)))}.png`));
  const gap=16,aw=1280-84,ah=791-84,ar=info.W/info.H;let fh=ah,fw=fh*ar;if(fw*cf.length+gap*(cf.length-1)>aw){fw=(aw-gap*(cf.length-1))/cf.length;fh=fw/ar}
  const full=ratio==='16:9'&&cf.length===1;
  const html=`<!doctype html><meta charset=utf-8><style>*{margin:0}body{width:1280px;height:791px;overflow:hidden;background:#0b0a0c;position:relative}
  .bg{position:absolute;inset:-80px;background:url("${cf[Math.floor(cf.length/2)]}") center/cover;filter:blur(42px) brightness(.55) saturate(1.1)}
  .row{position:absolute;inset:0;display:flex;gap:${gap}px;align-items:center;justify-content:center}
  .row img{width:${fw.toFixed(1)}px;height:${fh.toFixed(1)}px;border-radius:${full?0:10}px;box-shadow:0 26px 68px -16px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.08);display:block}
  .fullimg{position:absolute;left:0;top:50%;width:1280px;transform:translateY(-50%);display:block}</style>
  <div class=bg></div>${full?`<img class=fullimg src="${cf[0]}">`:`<div class=row>${cf.map(u=>`<img src="${u}">`).join('')}</div>`}`;
  const ch=path.join(dir,'cover.html'),cpng=path.join(dir,'cover.png');fs.writeFileSync(ch,html);
  const c=await b.newPage({viewport:{width:1280,height:791},deviceScaleFactor:1});await c.goto('file://'+ch);await c.waitForLoadState('networkidle');await c.screenshot({path:cpng});await b.close();
  const cover=path.join(ROOT,'img',`sm-${name}.webp`);
  for(let q=86;q>=40;q-=6){ff(['-i',cpng,'-c:v','libwebp','-quality',String(q),'-compression_level','6',cover]);if(kb(cover)<=90)break}
  const chk=path.join(shots,name+'-check.jpg');ff(['-i',out,'-vf',`select='not(mod(n\\,${Math.max(1,Math.floor(info.frames/8))}))',scale=${info.W>info.H?480:240}:-1,tile=8x1`,'-frames:v','1','-q:v','3',chk]);
  console.log(`OK ${out} crf=${crf} ${kb(out).toFixed(0)}KB poster ${kb(poster).toFixed(0)}KB cover ${kb(cover).toFixed(0)}KB${before?' before '+kb(before).toFixed(0)+'KB':''}\n   check ${chk}`);
})().catch(e=>{console.error(e);process.exit(1)});
