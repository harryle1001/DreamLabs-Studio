#!/usr/bin/env node
/* Ảnh bài viết từ ảnh có sẵn trên máy (vd ảnh AI 3840×2373 do scripts/zimage4k.mjs tạo bằng ComfyUI), không cần ImageMagick.
   node tools/blogimg-local.js <slug> <key> <file.png> [site="ComfyUI · Z-Image Turbo"]
   Kết quả giống tools/blogimg.js: img/blog/<slug>/<key>-{640,1280,1920,3840}.{avif,webp} (+ og.jpg nếu key=cover), credits.json có ai:true. */
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const R=path.join(__dirname,'..');
const [slug,key,src,site='ComfyUI · Z-Image Turbo']=process.argv.slice(2);
if(!src||!/^[a-z0-9-]+$/.test(slug)||!/^[a-z0-9-]+$/.test(key)||!fs.existsSync(src)){console.error('Cú pháp: node tools/blogimg-local.js <slug> <key> <file.png>');process.exit(2)}
const [w,h]=execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height','-of','csv=p=0',src]).toString().trim().split(',').map(Number);
if(w<3840){console.error(`Ảnh chỉ rộng ${w}px (< 3840px).`);process.exit(3)}
const DIR=path.join(R,'img/blog',slug);fs.mkdirSync(DIR,{recursive:true});
const ff=a=>execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...a]);
const crop='crop=iw:trunc(iw*791/1280/2)*2';                      /* khung 1280:791 */
for(const s of [640,1280,1920,3840]){
  const sh=Math.round(s*791/1280),f=path.join(DIR,`${key}-${s}`);
  const vf=`${crop},scale=${s}:${sh}:flags=lanczos${s<3840?',unsharp=5:5:0.4':''}`;
  ff(['-i',src,'-vf',vf,'-c:v','libwebp','-quality',s>=3840?'70':'76','-compression_level','6',f+'.webp']);
  ff(['-i',src,'-vf',vf+',format=yuv420p','-c:v','libaom-av1','-still-picture','1','-crf',s>=3840?'30':'28','-cpu-used','5',f+'.avif']);
}
if(key==='cover')ff(['-i',src,'-vf','scale=1200:630:force_original_aspect_ratio=increase:flags=lanczos,crop=1200:630','-q:v','3',path.join(DIR,'og.jpg')]);
const cf=path.join(DIR,'credits.json'),C=fs.existsSync(cf)?JSON.parse(fs.readFileSync(cf,'utf8')):{};
C[key]={author:'Dream Labs (ảnh AI)',page:'https://dreamlabs.vn/',site,ai:true,w,h};
fs.writeFileSync(cf,JSON.stringify(C,null,1)+'\n');
const kb=fs.readdirSync(DIR).filter(f=>f.startsWith(key+'-')).reduce((a,f)=>a+fs.statSync(path.join(DIR,f)).size,0)/1024;
console.log(`✓ ${slug}/${key}: ${w}×${h}, 8 tệp ${Math.round(kb)} KB`);
