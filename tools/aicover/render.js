#!/usr/bin/env node
/* Dựng ảnh bìa động cho 6 mẫu Tự động hóa AI từ tools/aicover/cover.html:
   media/sm-ai-<id>-c.mp4 + .webm (5 giây lặp, 960×594, không tiếng) và poster img/sm-ai-<id>-c.webp. Cần ffmpeg.
   node tools/aicover/render.js [id]   (bỏ trống = cả 6) */
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),{execFileSync}=require('child_process');
const R=path.join(__dirname,'../..'),MAP={'suong-tram':'chat','thien-do':'book','lam-khue':'care','hai-mien':'quote','vong-nguyet':'lead','ngoc-yen':'report'};
const FPS=30,SEC=5,N=FPS*SEC,W=960,H=594,ff=a=>execFileSync('ffmpeg',['-y','-loglevel','error',...a]);
(async()=>{const only=process.argv[2],b=await chromium.launch(),p=await b.newPage({viewport:{width:1280,height:791},deviceScaleFactor:1});
for(const [id,k] of Object.entries(MAP)){if(only&&only!==id)continue;
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aic-'));await p.goto('file://'+path.join(__dirname,'cover.html')+'?k='+k);
  for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/N);await p.screenshot({path:path.join(dir,String(i).padStart(4,'0')+'.png')})}
  const inp=['-framerate',String(FPS),'-i',path.join(dir,'%04d.png')],sc=['-vf',`scale=${W}:${H}:flags=lanczos`],base=path.join(R,'media','sm-ai-'+id+'-c');
  ff([...inp,...sc,'-c:v','libx264','-pix_fmt','yuv420p','-preset','slow','-crf','28','-movflags','+faststart','-an',base+'.mp4']);
  ff([...inp,...sc,'-c:v','libvpx-vp9','-b:v','0','-crf','42','-row-mt','1','-an',base+'.webm']);
  ff(['-i',path.join(dir,String(Math.round(N*.86)).padStart(4,'0')+'.png'),...sc,'-c:v','libwebp','-quality','82',path.join(R,'img','sm-ai-'+id+'-c.webp')]);
  fs.rmSync(dir,{recursive:true});
  console.log(id,['.mp4','.webm'].map(e=>e+' '+Math.round(fs.statSync(base+e).size/1024)+'KB').join(' · '))}
await b.close()})();
