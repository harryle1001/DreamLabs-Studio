#!/usr/bin/env node
/* reel2 — script xuất chung cho mọi phim mẫu. Cần server:  node serve.js 4205
   node tools/reel2/render.js <tên phim> [bước]
     <tên phim> = tên file HTML trong tools/reel2 (không đuôi), ví dụ motion-orvele, video-lamky
     bước > 1  : chỉ chụp thưa + ghép bảng khung hình <scratch>/shots/<tên>-sheet.png để xem thử (không nén)
     REUSE=1   : không chụp lại, dùng frame đã có trong scratch (khi lần trước bị ngắt giữa chừng)
     bước = 1  : chụp đủ khung -> media/sm-<tên>.mp4 (H.264 yuv420p, faststart, tự tăng CRF cho tới khi ≤ MAXKB)
                 + media/sm-<tên>.webp (poster) + img/sm-<tên>.webp (cover 1280×791 ≤ 70KB)
                 + với video-*: img/sm-<tên>-before.webp (cùng khung hình poster, bản ?raw chưa chỉnh màu)
                 + <scratch>/shots/<tên>-check.png (4 khung đầu · 1/3 · 2/3 · cuối trích từ MP4 để xem bằng mắt)
   Frame PNG nằm trong scratch, KHÔNG để trong dự án.  Biến môi trường: PORT, SCR, CRF, MAXKB */
const {chromium}=require('playwright'),{execFileSync}=require('child_process'),fs=require('fs'),path=require('path');
const [name,stepArg='1']=process.argv.slice(2),step=+stepArg||1;
if(!name){console.error('thiếu tên phim');process.exit(1)}
const ROOT=path.join(__dirname,'../..'),PORT=process.env.PORT||4205;
const SCR=process.env.SCR||'/tmp/claude-0/-home-user/2c805972-97eb-57ae-8841-14adfe365124/scratchpad/M';
const dir=path.join(SCR,'frames',name+(step>1?'-s':'')),shots=path.join(SCR,'shots');
const MAXKB=+process.env.MAXKB||1120,ff=a=>execFileSync('ffmpeg',['-y','-loglevel','error',...a]);
const kb=f=>fs.statSync(f).size/1024,pad=n=>String(n).padStart(4,'0');
(async()=>{
  const REUSE=process.env.REUSE==='1'&&fs.existsSync(path.join(dir,'f0000.png'));   /* REUSE=1: dùng lại frame đã chụp, chỉ nén + xuất poster/cover/before */
  if(!REUSE)fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(shots,{recursive:true});
  const b=await chromium.launch();
  const open=async(q,vp)=>{const p=await b.newPage({viewport:vp||{width:1280,height:1280},deviceScaleFactor:1});
    const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('requestfailed',r=>errs.push('REQFAIL '+r.url()));
    await p.goto(`http://127.0.0.1:${PORT}/tools/reel2/${name}.html${q}`,{waitUntil:'load'});
    await p.waitForFunction(()=>window.__ready===true,null,{timeout:180000});await p.evaluate(()=>document.fonts.ready);
    const info=await p.evaluate(()=>window.__info);await p.setViewportSize({width:info.W,height:info.H});
    return {p,info,errs}};
  const seek=(p,t)=>p.evaluate(t=>new Promise(r=>{window.__tl.time(t,false);requestAnimationFrame(()=>requestAnimationFrame(r))}),t);
  const {p,info,errs}=await open('');
  console.log(name,JSON.stringify(info),errs.length?errs:'no errors');
  const t0=Date.now();let n=0;
  if(!REUSE)for(let i=0;i<info.frames;i+=step){await seek(p,i/info.fps);await p.screenshot({path:path.join(dir,`f${pad(step>1?n:i)}.png`)});n++;
    if(n%60===0)console.log(' ',n,'frames',((Date.now()-t0)/1000).toFixed(0)+'s')}
  console.log('captured',n,'frames in',((Date.now()-t0)/1000).toFixed(0)+'s',errs.length?errs:'');
  if(step>1){
    const cols=info.W>info.H?4:Math.min(n,8),cw=info.W>info.H?480:info.W===info.H?300:200;
    const out=path.join(shots,name+'-sheet.png');
    ff(['-framerate','1','-i',path.join(dir,'f%04d.png'),'-vf',`scale=${cw}:-1,tile=${cols}x${Math.ceil(n/cols)}:padding=4:color=0x333333`,'-frames:v','1',out]);
    console.log('sheet',out);await b.close();return}
  /* ---- nén H.264 ---- */
  const out=path.join(ROOT,'media',`sm-${name}.mp4`);let crf=+process.env.CRF||19;
  for(;;crf++){ff(['-framerate',String(info.fps),'-i',path.join(dir,'f%04d.png'),'-c:v','libx264','-profile:v','high','-pix_fmt','yuv420p','-crf',String(crf),'-preset',process.env.PRESET||'slower','-x264-params','aq-mode=3:deblock=0,0','-movflags','+faststart','-an',out]);
    if(kb(out)<=MAXKB||crf>=34)break;crf+=Math.max(0,Math.ceil(6*Math.log2(kb(out)/MAXKB))-1)}   /* +6 CRF ≈ nửa dung lượng: nhảy thẳng tới gần đích */
  /* ---- poster ---- */
  const pf=Math.min(info.frames-1,Math.round(info.poster*info.fps)),pPng=path.join(dir,`f${pad(pf)}.png`);
  const poster=path.join(ROOT,'media',`sm-${name}.webp`);
  ff(['-i',pPng,'-c:v','libwebp','-quality','80','-compression_level','6',poster]);
  /* ---- before (bản chưa chỉnh màu) ---- */
  let before=null;
  if(name.startsWith('video-')){const r=await open('?raw');await seek(r.p,pf/info.fps);const bp=path.join(dir,'before.png');await r.p.screenshot({path:bp});await r.p.close();
    before=path.join(ROOT,'img',`sm-${name}-before.webp`);ff(['-i',bp,'-c:v','libwebp','-quality','80','-compression_level','6',before]);if(r.errs.length)console.log('raw errs',r.errs)}
  /* ---- cover 1280×791: khung hình đặt trên nền mờ của chính nó ---- */
  const ratio=info.W>info.H?'16:9':info.W<info.H?'9:16':'1:1';
  const ct=info.cover||(ratio==='16:9'?[info.poster]:ratio==='9:16'?[info.duration*.3,info.poster,info.duration*.88]:[info.poster,info.duration*.9]);
  const cf=ct.map(t=>'file://'+path.join(dir,`f${pad(Math.min(info.frames-1,Math.round(t*info.fps)))}.png`));
  const gap=16,aw=1280-84,ah=791-84,ar=info.W/info.H;let fh=ah,fw=fh*ar;if(fw*cf.length+gap*(cf.length-1)>aw){fw=(aw-gap*(cf.length-1))/cf.length;fh=fw/ar}
  const full=ratio==='16:9'&&cf.length===1;
  const html=`<!doctype html><meta charset=utf-8><style>*{margin:0}body{width:1280px;height:791px;overflow:hidden;background:#0b0a0c;position:relative}
  .bg{position:absolute;inset:-80px;background:url("${cf[Math.floor(cf.length/2)]}") center/cover;filter:blur(42px) brightness(.55) saturate(1.1)}
  .row{position:absolute;inset:0;display:flex;gap:${gap}px;align-items:center;justify-content:center}
  .row img{width:${fw.toFixed(1)}px;height:${fh.toFixed(1)}px;border-radius:${full?0:10}px;box-shadow:0 26px 68px -16px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.08);display:block}
  .fullimg{position:absolute;left:0;top:50%;width:1280px;transform:translateY(-50%);display:block}
  .bar{position:absolute;left:0;right:0;height:${((791-720)/2).toFixed(1)}px;background:#060507}</style>
  <div class=bg></div>${full?`<img class=fullimg src="${cf[0]}"><div class=bar style="top:0"></div><div class=bar style="bottom:0"></div>`:`<div class=row>${cf.map(u=>`<img src="${u}">`).join('')}</div>`}`;
  const ch=path.join(dir,'cover.html'),cpng=path.join(dir,'cover.png');fs.writeFileSync(ch,html);
  const c=await b.newPage({viewport:{width:1280,height:791},deviceScaleFactor:1});await c.goto('file://'+ch);await c.waitForLoadState('networkidle');await c.screenshot({path:cpng});await b.close();
  const cover=path.join(ROOT,'img',`sm-${name}.webp`);
  for(let q=84;q>=30;q-=6){ff(['-i',cpng,'-c:v','libwebp','-quality',String(q),'-compression_level','6',cover]);if(kb(cover)<=68)break}
  /* ---- bảng kiểm 4 khung trích từ MP4 ---- */
  const {out:chk,probe:pr}=require('./check.js')(name,shots);
  console.log(`OK ${out} crf=${crf} ${kb(out).toFixed(0)}KB | ${pr}\n   poster ${kb(poster).toFixed(0)}KB  cover ${kb(cover).toFixed(0)}KB${before?'  before '+kb(before).toFixed(0)+'KB':''}\n   check ${chk}`);
})().catch(e=>{console.error(e);process.exit(1)});
