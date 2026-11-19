#!/usr/bin/env node
/* Ảnh cho bài viết: tải ảnh gốc (Pexels / Unsplash, giấy phép dùng thương mại), cắt khung 1280:791, xuất avif + webp 4 cỡ, ghi nguồn.
   node tools/blogimg.js <slug> <key> <url-ảnh-gốc> "<tác giả>" <link-trang-ảnh> <Pexels|Unsplash> [tùy chọn]
     key: cover (ảnh bìa, kèm og.jpg 1200×630) hoặc tên ngắn không dấu (a1, a2…) để chèn trong bài bằng {{anh:key|alt|chú thích}}
     tùy chọn: g=north|south|center|east|west (vùng giữ lại khi cắt, mặc định center)
               blur=x,y,w,h  (tỷ lệ 0–1 trên ảnh gốc; làm mờ vùng có logo / chữ hãng; dùng nhiều lần được)
               min=3840      (chiều ngang tối thiểu của ảnh gốc)
   Kết quả: img/blog/<slug>/<key>-{640,1280,1920,3840}.{avif,webp}, img/blog/<slug>/credits.json (tools/blog.js đọc để ghi nguồn cuối bài). */
const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const R=path.join(__dirname,'..');
const [slug,key,url,author,page,site,...opt]=process.argv.slice(2);
if(!site||!/^[a-z0-9-]+$/.test(slug)||!/^[a-z0-9-]+$/.test(key)){console.error('Cú pháp: node tools/blogimg.js <slug> <key> <url> "<tác giả>" <link-trang-ảnh> <Pexels|Unsplash> [g=center] [blur=x,y,w,h]');process.exit(2)}
if(!/^https:\/\/images\.(pexels|unsplash)\.com\//.test(url)){console.error('Chỉ nhận ảnh từ images.pexels.com hoặc images.unsplash.com');process.exit(2)}
const O={g:'center',min:3840,blur:[]};for(const o of opt){const [k,v]=o.split('=');if(k==='blur')O.blur.push(v.split(',').map(Number));else O[k]=k==='min'?+v:v}
const DIR=path.join(R,'img/blog',slug);fs.mkdirSync(DIR,{recursive:true});
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'blimg-')),src=path.join(tmp,'src.jpg');
const dl=/pexels/.test(url)?url.split('?')[0]:url.split('?')[0]+'?fm=jpg&q=92&w=6000';
execFileSync('curl',['-sSfL','--retry','3','-o',src,dl]);
const [w,h]=execFileSync('identify',['-format','%w %h',src+'[0]']).toString().split(' ').map(Number);
if(w<O.min){console.error(`Ảnh gốc chỉ rộng ${w}px (< ${O.min}px). Chọn ảnh khác.`);process.exit(3)}
/* làm mờ vùng logo trên ảnh gốc */
let base=src;
if(O.blur.length){const b=path.join(tmp,'blur.png');const args=[src];
  for(const [x,y,bw,bh] of O.blur){const g=`${Math.round(bw*w)}x${Math.round(bh*h)}+${Math.round(x*w)}+${Math.round(y*h)}`;args.push('(','+clone','-crop',g,'-blur','0x40',')','-geometry','+'+Math.round(x*w)+'+'+Math.round(y*h),'-composite')}
  args.push(b);execFileSync('convert',args);base=b}
/* cắt khung 1280:791 ở cỡ 3840×2373 */
const W=3840,H=Math.round(W*791/1280),master=path.join(tmp,'m.png');
execFileSync('convert',[base,'-auto-orient','-colorspace','sRGB','-resize',`${W}x${H}^`,'-gravity',O.g,'-extent',`${W}x${H}`,'-strip',master]);
for(const s of [640,1280,1920,3840]){
  const sh=Math.round(s*791/1280),f=path.join(DIR,`${key}-${s}`),r=path.join(tmp,`r${s}.png`);
  execFileSync('convert',[master,'-resize',`${s}x${sh}!`,'-unsharp','0x0.6+0.6+0.02',r]);
  execFileSync('convert',[r,'-quality',s>=3840?'70':'76','-define','webp:method=6',f+'.webp']);
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',r,'-c:v','libaom-av1','-still-picture','1','-crf',s>=3840?'30':'28','-cpu-used','5','-pix_fmt','yuv420p',f+'.avif']);
}
if(key==='cover')execFileSync('convert',[base,'-auto-orient','-colorspace','sRGB','-resize','1200x630^','-gravity',O.g,'-extent','1200x630','-strip','-quality','84','-interlace','JPEG',path.join(DIR,'og.jpg')]);
fs.rmSync(tmp,{recursive:true,force:true});
const cf=path.join(DIR,'credits.json'),C=fs.existsSync(cf)?JSON.parse(fs.readFileSync(cf,'utf8')):{};
C[key]={author,page,site,src:dl.split('?')[0],w,h};
fs.writeFileSync(cf,JSON.stringify(C,null,1)+'\n');
const kb=fs.readdirSync(DIR).filter(f=>f.startsWith(key+'-')).reduce((a,f)=>a+fs.statSync(path.join(DIR,f)).size,0)/1024;
console.log(`✓ ${slug}/${key}: gốc ${w}×${h}, 8 tệp ${Math.round(kb)} KB`);
