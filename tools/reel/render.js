#!/usr/bin/env node
/* Xuất showreel: Playwright nhảy từng khung hình của GSAP timeline (window.__tl) -> PNG -> ffmpeg H.264.
   Cần server đang chạy:  node serve.js 4103
   node tools/reel/render.js h <thư mục frame> [bước]   -> bản ngang 1280×792  -> media/showreel.mp4 + media/showreel-poster.webp
   node tools/reel/render.js v <thư mục frame> [bước]   -> bản dọc 720×1280    -> media/dreamlab-ad-9x16.mp4 + poster
   bước > 1: chỉ chụp thưa để xem thử (không nén video).  Frame PNG để trong thư mục scratch, KHÔNG để trong dự án. */
const {chromium}=require('playwright'),{execFileSync}=require('child_process'),fs=require('fs'),path=require('path');
const [fmt='h',dir='/tmp/reel-frames',stepArg='1']=process.argv.slice(2),step=+stepArg||1,V=fmt==='v';
const ROOT=path.join(__dirname,'../..'),PORT=process.env.PORT||4103,CRF=process.env.CRF||(V?24:22);
(async()=>{
  fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
  const b=await chromium.launch(),W=V?720:1280,H=V?1280:792;
  const p=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:1,colorScheme:'light'});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('requestfailed',r=>errs.push('REQFAIL '+r.url()));
  await p.goto(`http://127.0.0.1:${PORT}/tools/reel/reel.html${V?'?v':''}`,{waitUntil:'load'});
  await p.waitForFunction(()=>window.__ready===true);await p.evaluate(()=>document.fonts.ready);
  const info=await p.evaluate(()=>window.__info);console.log(info,errs.length?errs:'no errors');
  const t0=Date.now();let n=0;
  for(let i=0;i<info.frames;i+=step){
    await p.evaluate(t=>new Promise(r=>{window.__tl.time(t,false);requestAnimationFrame(()=>requestAnimationFrame(r))}),i/info.fps);
    await p.screenshot({path:path.join(dir,`f${String(step>1?i:n).padStart(4,'0')}.png`)});n++;
    if(n%90===0)console.log(n,'frames',((Date.now()-t0)/1000).toFixed(0)+'s');
  }
  await b.close();console.log('captured',n,'frames in',((Date.now()-t0)/1000).toFixed(0)+'s',errs.length?errs:'');
  if(step>1)return;
  const out=path.join(ROOT,'media',V?'dreamlab-ad-9x16.mp4':'showreel.mp4'),poster=path.join(ROOT,'media',V?'dreamlab-ad-9x16-poster.webp':'showreel-poster.webp');
  execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',path.join(dir,'f%04d.png'),'-c:v','libx264','-profile:v','high','-pix_fmt','yuv420p','-crf',String(CRF),'-preset','slow','-movflags','+faststart','-an',out]);
  const pf=Math.round((info.duration-.3)*info.fps);
  execFileSync('ffmpeg',['-y','-loglevel','error','-i',path.join(dir,`f${String(pf).padStart(4,'0')}.png`),'-c:v','libwebp','-quality','82',poster]);
  console.log(out,(fs.statSync(out).size/1048576).toFixed(2)+'MB',poster,(fs.statSync(poster).size/1024).toFixed(0)+'KB');
})();
