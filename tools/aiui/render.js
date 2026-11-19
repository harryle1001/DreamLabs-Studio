#!/usr/bin/env node
/* Dựng màn hình phần mềm mẫu cho bộ Tự động hóa AI (tools/aiui/scene.html):
   - ảnh gốc 3840×2376 (deviceScaleFactor 3) → img/ai/<cảnh>-{640,1280,1920,3840}.webp + -{1280,1920}.avif
   - clip 6 giây lặp 1280×792 → media/ai-<cảnh>.mp4 + .webm (muted)
   node tools/aiui/render.js [cảnh,cảnh] [--no-clip]   Cần ffmpeg (libwebp, libaom-av1, libx264, libvpx-vp9). */
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),{execFileSync}=require('child_process');
const R=path.join(__dirname,'../..'),ALL=['report','ledger','chat','calendar','inventory','plan','quote','crm','care'];
const arg=process.argv.slice(2),only=(arg.find(a=>!a.startsWith('--'))||'').split(',').filter(Boolean),noClip=arg.includes('--no-clip');
const FPS=24,SEC=6,N=FPS*SEC,POSTER=5.2,ff=a=>execFileSync('ffmpeg',['-y','-loglevel','error',...a]);
const kb=f=>Math.round(fs.statSync(f).size/1024)+'KB';
fs.mkdirSync(path.join(R,'img/ai'),{recursive:true});
(async()=>{const b=await chromium.launch();
for(const k of (only.length?only:ALL)){const url='file://'+path.join(__dirname,'scene.html')+'?k='+k;
  /* ảnh tĩnh 4K */
  const p4=await b.newPage({viewport:{width:1280,height:792},deviceScaleFactor:3});await p4.goto(url+'&t='+POSTER);await p4.evaluate(()=>document.fonts.ready);await p4.waitForTimeout(200);
  const png=path.join(os.tmpdir(),'ai-'+k+'.png');await p4.screenshot({path:png});await p4.close();
  const out=[];for(const w of [640,1280,1920,3840]){const f=path.join(R,'img/ai',`${k}-${w}.webp`);ff(['-i',png,'-vf',`scale=${w}:-2:flags=lanczos`,'-c:v','libwebp','-quality',w>=1920?'80':'84','-compression_level','6',f]);out.push(w+':'+kb(f))}
  for(const w of [1280,1920]){const f=path.join(R,'img/ai',`${k}-${w}.avif`);ff(['-i',png,'-vf',`scale=${w}:-2:flags=lanczos,format=yuv444p`,'-c:v','libaom-av1','-still-picture','1','-crf','30','-cpu-used','4',f]);out.push(w+'avif:'+kb(f))}
  fs.unlinkSync(png);
  /* clip */
  if(!noClip){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aiui-'));const p=await b.newPage({viewport:{width:1280,height:792},deviceScaleFactor:1});await p.goto(url+'&t=0');await p.evaluate(()=>document.fonts.ready);
    for(let i=0;i<N;i++){await p.evaluate(t=>frame(t),i/FPS);await p.screenshot({path:path.join(dir,String(i).padStart(4,'0')+'.png')})}await p.close();
    const inp=['-framerate',String(FPS),'-i',path.join(dir,'%04d.png')],base=path.join(R,'media','ai-'+k);
    ff([...inp,'-c:v','libx264','-pix_fmt','yuv420p','-preset','slow','-crf','26','-tune','stillimage','-movflags','+faststart','-an',base+'.mp4']);
    ff([...inp,'-c:v','libvpx-vp9','-b:v','0','-crf','46','-row-mt','1','-an',base+'.webm']);
    fs.rmSync(dir,{recursive:true});out.push('mp4:'+kb(base+'.mp4'),'webm:'+kb(base+'.webm'))}
  console.log(k,out.join(' '))}
await b.close()})();
