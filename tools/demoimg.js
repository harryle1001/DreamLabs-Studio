#!/usr/bin/env node
/* Ảnh cho demo: tải ảnh gốc (Pexels / Unsplash, giấy phép dùng thương mại), cắt khung, làm mờ logo, xuất avif + webp nhiều cỡ, ghi nguồn.
   node tools/demoimg.js <demo-slug> <key> <url-ảnh-gốc> "<tác giả>" <link-trang-ảnh> <Pexels|Unsplash> [tùy chọn]
     tùy chọn: ar=3:2        tỷ lệ khung (mặc định 3:2; vd 16:9, 4:5, 1:1, 21:9)
               g=center      vùng giữ lại khi cắt (north|south|east|west|center|northeast…)
               blur=x,y,w,h  tỷ lệ 0–1 trên ẢNH GỐC: làm mờ logo hãng, biển số, chữ (dùng nhiều lần được)
               sizes=640,1280,1920,2560   các cỡ chiều ngang xuất ra
               min=3000      chiều ngang tối thiểu của ảnh gốc
               mono=1        chuyển đen trắng
   Kết quả: img/demo/<slug>/<key>-<cỡ>.{avif,webp}, img/demo/<slug>/credits.json; cập nhật img/demo/CREDITS.md.
   Dùng trong demo: <picture><source type="image/avif" srcset="../img/demo/<slug>/<key>-640.avif 640w, …"><img src="…-1280.webp" srcset="…webp" sizes="…" loading="lazy" decoding="async" width height alt></picture> */
const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const R=path.join(__dirname,'..');
const [slug,key,url,author,page,site,...opt]=process.argv.slice(2);
if(!site||!/^[a-z0-9-]+$/.test(slug||'')||!/^[a-z0-9-]+$/.test(key||'')){console.error('Cú pháp: node tools/demoimg.js <slug> <key> <url> "<tác giả>" <link-trang-ảnh> <Pexels|Unsplash> [ar=3:2] [g=center] [blur=x,y,w,h]');process.exit(2)}
if(!/^https:\/\/images\.(pexels|unsplash)\.com\//.test(url)){console.error('Chỉ nhận ảnh từ images.pexels.com hoặc images.unsplash.com');process.exit(2)}
const O={g:'center',min:3000,ar:'3:2',blur:[],sizes:[640,1280,1920,2560],mono:0};
for(const o of opt){const i=o.indexOf('='),k=o.slice(0,i),v=o.slice(i+1);if(k==='blur')O.blur.push(v.split(',').map(Number));else if(k==='sizes')O.sizes=v.split(',').map(Number);else O[k]=k==='min'?+v:v}
const [aw,ah]=O.ar.split(':').map(Number);
const DIR=path.join(R,'img/demo',slug);fs.mkdirSync(DIR,{recursive:true});
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dmimg-')),src=path.join(tmp,'src.jpg');
const dl=/pexels/.test(url)?url.split('?')[0]:url.split('?')[0]+'?fm=jpg&q=92&w=6000';
execFileSync('curl',['-sSfL','--retry','3','-o',src,dl]);
const [w,h]=execFileSync('identify',['-format','%w %h',src+'[0]']).toString().split(' ').map(Number);
if(w<O.min&&h<O.min){console.error(`Ảnh gốc chỉ ${w}×${h}px (< ${O.min}px). Chọn ảnh khác.`);process.exit(3)}
let base=src;
if(O.blur.length){const b=path.join(tmp,'blur.png');const args=[src,'-auto-orient'];
  for(const [x,y,bw,bh] of O.blur){const gw=Math.round(bw*w),gh=Math.round(bh*h),gx=Math.round(x*w),gy=Math.round(y*h);
    args.push('(','+clone','-crop',`${gw}x${gh}+${gx}+${gy}`,'+repage','-scale','4%','-scale',`${gw}x${gh}!`,'-blur','0x'+Math.max(6,Math.round(Math.min(gw,gh)/6)),')','-geometry',`+${gx}+${gy}`,'-composite')}
  args.push(b);execFileSync('convert',args);base=b}
const big=Math.max(...O.sizes),W=Math.min(big,w),H=Math.round(W*ah/aw),master=path.join(tmp,'m.png');
execFileSync('convert',[base,'-auto-orient','-colorspace','sRGB','-resize',`${W}x${H}^`,'-gravity',O.g,'-extent',`${W}x${H}`,...(O.mono?['-colorspace','Gray','-colorspace','sRGB']:[]),'-strip',master]);
for(const f of fs.readdirSync(DIR))if(f.startsWith(key+'-')&&/\.(webp|avif)$/.test(f))fs.unlinkSync(path.join(DIR,f));
const out=[];
for(const s of O.sizes.filter(s=>s<=W)){
  const sh=Math.round(s*ah/aw),f=path.join(DIR,`${key}-${s}`),r=path.join(tmp,`r${s}.png`);
  execFileSync('convert',[master,'-resize',`${s}x${sh}!`,'-unsharp','0x0.6+0.6+0.02',r]);
  execFileSync('convert',[r,'-quality',s>=2560?'70':'76','-define','webp:method=6',f+'.webp']);
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',r,'-c:v','libaom-av1','-still-picture','1','-crf',s>=2560?'32':'29','-cpu-used','6','-pix_fmt','yuv420p',f+'.avif']);
  out.push(s);
}
fs.rmSync(tmp,{recursive:true,force:true});
const cf=path.join(DIR,'credits.json'),C=fs.existsSync(cf)?JSON.parse(fs.readFileSync(cf,'utf8')):{};
C[key]={author,page,site,src:dl.split('?')[0],w,h,ar:O.ar,sizes:out,blur:O.blur.length?O.blur:undefined};
fs.writeFileSync(cf,JSON.stringify(C,null,1)+'\n');
/* gộp mọi credits.json thành img/demo/CREDITS.md (nội bộ) */
const rows=[];for(const d of fs.readdirSync(path.join(R,'img/demo')).sort()){const p=path.join(R,'img/demo',d,'credits.json');if(!fs.existsSync(p))continue;
  const J=JSON.parse(fs.readFileSync(p,'utf8'));for(const [k,v] of Object.entries(J))rows.push(`| ${d} | ${k} | ${v.author} | ${v.site} | ${v.page} | ${v.w}×${v.h}${v.blur?' · đã làm mờ logo':''} |`)}
fs.writeFileSync(path.join(R,'img/demo/CREDITS.md'),`# Nguồn ảnh demo (nội bộ)\n\nẢnh tải từ Pexels / Unsplash theo giấy phép miễn phí cho mục đích thương mại (https://www.pexels.com/license/ , https://unsplash.com/license). Logo hãng, biển số đã làm mờ. Tự sinh bởi tools/demoimg.js.\n\n| Demo | Ảnh | Tác giả | Nguồn | Link | Gốc |\n|---|---|---|---|---|---|\n${rows.join('\n')}\n`);
const kb=fs.readdirSync(DIR).filter(f=>f.startsWith(key+'-')).reduce((a,f)=>a+fs.statSync(path.join(DIR,f)).size,0)/1024;
console.log(`✓ ${slug}/${key}: gốc ${w}×${h} → ${O.ar}, cỡ ${out.join('/')}, ${Math.round(kb)} KB`);
