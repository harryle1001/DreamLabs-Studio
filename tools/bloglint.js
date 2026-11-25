#!/usr/bin/env node
/* Kiểm tra nhanh một bài trước khi dựng (không ghi file): node tools/bloglint.js <slug> [<slug>…]
   Báo: số chữ, title/description, ảnh (3–5, có nguồn), FAQ 5–8, {{zalo}}, liên kết nội bộ tồn tại, bảng giá. */
const fs=require('fs'),path=require('path'),R=path.join(__dirname,'..');
const strip=s=>String(s).replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const words=h=>strip(h).split(' ').filter(w=>/[\p{L}\p{N}]/u.test(w)).length;
let bad=0;
for(const slug of process.argv.slice(2)){
  const f=path.join(R,'src/blog',slug+'.html'),E=[],W=[];
  if(!fs.existsSync(f)){console.log('✗',slug,'không có file');bad++;continue}
  const raw=fs.readFileSync(f,'utf8'),m=raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);let M;
  try{M=JSON.parse(m[1])}catch(e){console.log('✗',slug,'meta JSON lỗi:',e.message);bad++;continue}
  const body=raw.slice(m[0].length);
  for(const k of ['date','title','h1','short','description','lead','cat','cat_id','keywords','imageAlt','imageCaption','related','ctaTitle','ctaText'])if(!M[k])E.push('thiếu meta '+k);
  if((M.title||'').length>60)E.push(`title ${M.title.length} > 60`);
  if((M.description||'').length>155)E.push(`description ${M.description.length} > 155`);
  const cf=path.join(R,'img/blog',slug,'credits.json'),C=fs.existsSync(cf)?JSON.parse(fs.readFileSync(cf,'utf8')):{};
  if(!C.cover)E.push('chưa có ảnh bìa (tools/blogimg.js '+slug+' cover …)');
  const imgs=[...body.matchAll(/\{\{anh:([a-z0-9-]+)\|([^|}]+)/g)];
  for(const [,k] of imgs)if(!C[k])E.push('ảnh '+k+' chưa tải');
  if(imgs.length+1<3||imgs.length+1>5)E.push(`tổng ảnh ${imgs.length+1} (cần 3–5, kể cả bìa)`);
  if(!/\{\{zalo\}\}/.test(body))E.push('thiếu {{zalo}} giữa bài');
  if(!/href="\.\.\/\.\.\/bang-gia\/"/.test(body))E.push('thiếu liên kết ../../bang-gia/');
  const fi=body.indexOf('<h2 id="cau-hoi">');const nq=fi<0?0:(body.slice(fi).match(/<h3>/g)||[]).length;
  if(nq<5||nq>8)E.push(`FAQ ${nq} câu (cần 5–8)`);
  for(const [,h] of body.matchAll(/href="(\.\.\/[^"#]*)/g)){
    const p=path.posix.normalize(path.posix.join("blog",slug,h));                    /* blog/<slug>/ + ../../x/ */
    const s=p.replace(/\/$/,'');
    const ok=s.startsWith('blog/')?fs.existsSync(path.join(R,'src',s+'.html')):(fs.existsSync(path.join(R,'src/pages',s+'.html'))||fs.existsSync(path.join(R,s)));
    if(!ok)E.push('liên kết hỏng: '+h);
  }
  const rel=(M.related||[]).filter(r=>!fs.existsSync(path.join(R,'src/blog',r+'.html')));if(rel.length)W.push('related chưa có (có thể bài khác đang viết): '+rel.join(', '));
  const n=words(body.replace(/<table[\s\S]*?<\/table>/g,'').replace(/\{\{[^}]*\}\}/g,''));
  if(n<1800)E.push(`chỉ ${n} chữ (< 1800)`);if(n>2600)W.push(`${n} chữ (> 2500)`);
  if(/tỷ lệ vàng|1[.,]618|φ/i.test(body+m[1]))E.push('nhắc tỷ lệ vàng / φ');
  console.log(E.length?'✗':'✓',slug,`${n} chữ · ${imgs.length+1} ảnh · ${nq} FAQ · title ${(M.title||'').length} · desc ${(M.description||'').length}`);
  for(const e of E)console.log('   ✗',e);for(const w of W)console.log('   ⚠',w);
  if(E.length)bad++;
}
process.exitCode=bad?1:0;
