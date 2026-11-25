#!/usr/bin/env node
/* Dựng mục Bài viết: node tools/blog.js
   Nguồn: src/blog/<slug>.html — dòng đầu là chú thích <!--meta {...} --> (JSON), phần còn lại là thân bài HTML.
     Trong thân bài: {{gia:<id>}} chèn bảng giá lấy từ js/data.js (luôn khớp bảng giá trang chủ); {{p:<id>:<i>}} giá gói thứ i, {{tu:<id>}} giá thấp nhất.
     Mục "Câu hỏi thường gặp": <h2 id="cau-hoi">…</h2> rồi các cặp <h3>câu hỏi</h3><p>trả lời</p> (tự sinh FAQPage JSON-LD).
   Khung trang dùng chung với trang dịch vụ: tools/site.js.
   Kết quả: blog/index.html, blog/<slug>/index.html, sitemap.xml.
   build.js tự gọi file này nên thường không cần chạy riêng. */
const fs=require('fs'),path=require('path');
const S=require('./site.js');
const {R,SITE,esc,strip,ld,countWords,CATS,ZALO,PHONE,fmtDate,priceTable,outline,checkLen,org,crumbs,faqLd,page,svcHref,ICON}=S;
const OUT=path.join(R,'blog');

/* đọc bài (khung chung, menu, chân trang: tools/site.js) */
const posts=S.POSTS.map(m=>{
  const o=outline(m.raw.replace(/\{\{gia:(\w+)\}\}/g,(_,id)=>priceTable(id))
    .replace(/\{\{p:(\w+):(\d)\}\}/g,(_,id,i)=>S.priceText(S.cat(id).tiers[+i])).replace(/\{\{tu:(\w+)\}\}/g,(_,id)=>S.vnd(Math.min(...S.cat(id).tiers.map(t=>t.p)))));
  const words=countWords(o.body.replace(/<table[\s\S]*?<\/table>/g,''));
  const cf=path.join(R,'img/blog',m.slug,'credits.json'),credits=fs.existsSync(cf)?JSON.parse(fs.readFileSync(cf,'utf8')):{};
  const pic=!!credits.cover;   /* ảnh bìa riêng (tools/blogimg.js): img/blog/<slug>/cover-*.{avif,webp} + og.jpg */
  return{...m,...o,words,credits,pic,image:pic?`img/blog/${m.slug}/cover-1280.webp`:m.image,og:pic?`img/blog/${m.slug}/og.jpg`:m.image,
    read:Math.max(1,Math.round(words/200)),url:SITE+'blog/'+m.slug+'/'};
});
/* <picture> nhiều cỡ: avif + webp 640/1280/1920/3840 */
const SZ=[640,1280,1920,3840];
const picture=(base,alt,{sizes='(min-width:1024px) 760px, 100vw',lazy=true,cls=''}={})=>`<picture${cls?` class="${cls}"`:''}><source type="image/avif" srcset="${SZ.map(s=>`${base}-${s}.avif ${s}w`).join(', ')}" sizes="${sizes}"><source type="image/webp" srcset="${SZ.map(s=>`${base}-${s}.webp ${s}w`).join(', ')}" sizes="${sizes}"><img src="${base}-1280.webp" width="1280" height="791" alt="${esc(alt)}"${lazy?' loading="lazy"':' fetchpriority="high"'} decoding="async"></picture>`;
/* mã chèn trong thân bài: {{anh:key|alt|chú thích}} ảnh trong bài, {{zalo}} khối liên hệ giữa bài */
const ZALO_BOX=`<aside class="bl-mid" aria-label="Liên hệ Dream Labs"><p><b>Cần người xem giúp trường hợp của bạn?</b> Nhắn Zalo <a href="${ZALO}" target="_blank" rel="noopener">${esc(PHONE)}</a> cho Dream Labs: mô tả ngắn việc bạn đang làm, chúng tôi trả lời trong giờ làm việc, tư vấn miễn phí.</p><a class="btn primary sm" href="${ZALO}" target="_blank" rel="noopener">Nhắn Zalo ${esc(PHONE)}</a></aside>`;
for(const p of posts){
  p.body=p.body.replace(/\{\{anh:([a-z0-9-]+)\|([^|}]+)(?:\|([^}]*))?\}\}/g,(_,k,alt,cap)=>{
    if(!p.credits[k])throw new Error(p.slug+': chưa có ảnh '+k+' (chạy tools/blogimg.js)');
    return `<figure class="bl-fig">${picture(`../../img/blog/${p.slug}/${k}`,alt.trim())}${cap&&cap.trim()?`<figcaption>${cap.trim()}</figcaption>`:''}</figure>`;
  }).replace(/\{\{zalo\}\}/g,ZALO_BOX);
}
const creditLine=p=>{const e=Object.entries(p.credits);if(!e.length)return'';
  if(e.every(([,c])=>c.ai))return `<p class="bl-src"><b>Nguồn ảnh:</b> ảnh minh họa do Dream Labs tạo bằng AI (${esc(e[0][1].site)}), không phải ảnh chụp khách hàng hay dự án thật.</p>`;
  return `<p class="bl-src"><b>Nguồn ảnh:</b> ${e.map(([k,c])=>`${k==='cover'?'ảnh bìa':'ảnh '+k.replace(/^a/,'')}: <a href="${esc(c.page)}" target="_blank" rel="noopener nofollow">${esc(c.author)} / ${esc(c.site)}</a>`).join(' · ')}. Ảnh dùng theo giấy phép miễn phí của ${[...new Set(e.map(([,c])=>c.site))].join(', ')}, chỉ mang tính minh họa.</p>`};
for(const p of posts)checkLen(p.slug,p.title,p.description);

const card=(p,up,h='h2')=>`<article class="bl-card"><a href="${up}${p.slug}/"><span class="bl-card-img">${p.pic?picture(`${up}../img/blog/${p.slug}/cover`,p.imageAlt,{sizes:'(min-width:860px) 33vw, 100vw'}):`<img src="${up}../${p.image}" width="1280" height="791" alt="${esc(p.imageAlt)}" loading="lazy" decoding="async">`}</span>
 <span class="bl-card-t"><small>${esc(p.cat)}</small><${h}>${esc(p.h1)}</${h}><span class="bl-card-d">${esc(p.description)}</span><span class="bl-card-m">${fmtDate(p.date)} · ${p.read} phút đọc</span></span></a></article>`;

/* trang từng bài */
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
for(const p of posts){
  const up='../../',cat=CATS.find(c=>c.id===p.cat_id);
  const related=(p.related||[]).map(s=>posts.find(x=>x.slug===s)).filter(Boolean).concat(posts.filter(x=>x!==p&&!(p.related||[]).includes(x.slug))).slice(0,3);
  const graph=[org,
    {'@type':'BlogPosting','@id':p.url+'#bai',headline:p.h1,description:p.description,inLanguage:'vi',url:p.url,mainEntityOfPage:p.url,
     image:[SITE+p.image,SITE+p.og],datePublished:p.date,dateModified:p.updated||p.date,wordCount:p.words,keywords:p.keywords.join(', '),articleSection:p.cat,
     author:{'@id':SITE+'#org'},publisher:{'@id':SITE+'#org'}},
    crumbs([['Trang chủ',SITE],['Bài viết',SITE+'blog/'],[p.h1,p.url]])];
  if(p.faq.length)graph.push(faqLd(p.url,p.faq));
  const toc=`<ol>${p.toc.map(t=>`<li><a href="#${t.id}">${esc(t.t)}</a></li>`).join('')}</ol>`;
  const main=`<nav class="bl-wrap bl-crumb" aria-label="Đường dẫn"><a href="${up}">Trang chủ</a><span aria-hidden="true">/</span><a href="../">Bài viết</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.short||p.h1)}</span></nav>
<article class="bl-post">
 <header class="bl-wrap bl-post-h">
  <p class="eyebrow">${esc(p.cat)}</p>
  <h1>${p.h1html||esc(p.h1)}</h1>
  <p class="bl-lead">${esc(p.lead||p.description)}</p>
  <p class="bl-meta"><span>Dream Labs</span><time datetime="${p.date}">${fmtDate(p.date)}</time><span>${p.read} phút đọc</span></p>
 </header>
 <figure class="bl-wrap bl-hero">${p.pic?picture(`${up}img/blog/${p.slug}/cover`,p.imageAlt,{sizes:'(min-width:1280px) 1240px, 100vw',lazy:false}):`<img src="${up}${p.image}" width="1280" height="791" alt="${esc(p.imageAlt)}" fetchpriority="high" decoding="async">`}<figcaption>${esc(p.imageCaption||p.imageAlt)}</figcaption></figure>
 <div class="bl-wrap bl-grid">
  <aside class="bl-toc" aria-label="Mục lục"><details open><summary>Mục lục</summary>${toc}</details></aside>
  <div class="bl-body">
${p.body.trim()}
   ${creditLine(p)}
   <section class="bl-cta" aria-label="Liên hệ Dream Labs">
    <p class="eyebrow">Bắt đầu cùng Dream Labs</p>
    <h2 class="bl-cta-h">${esc(p.ctaTitle||'Cần tư vấn cho trường hợp của bạn?')}</h2>
    <p>${esc(p.ctaText||'Nhắn Zalo để được tư vấn miễn phí, hoặc xem bảng giá chi tiết từng gói trên trang chủ.')}</p>
    <div class="bl-cta-act"><a class="btn primary" href="${svcHref(cat.id,up)}">Xem gói ${esc(cat.name)} ${ICON.arrow}</a><a class="btn" href="${up}bang-gia/">Toàn bộ bảng giá</a><a class="btn" href="${ZALO}" target="_blank" rel="noopener">Zalo ${esc(PHONE)}</a></div>
   </section>
  </div>
 </div>
</article>
<section class="bl-wrap bl-more" aria-labelledby="bl-more-h"><h2 id="bl-more-h">Bài viết liên quan</h2><div class="bl-cards">${related.map(r=>card(r,'../','h3')).join('')}</div></section>`;
  const dir=path.join(OUT,p.slug);fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),page({up,cur:'blog',title:p.title,desc:p.description,canonical:p.url,ogType:'article',image:p.og,imageAlt:p.imageAlt,jsonld:ld({'@context':'https://schema.org','@graph':graph}),main,
    extraHead:`<meta property="article:published_time" content="${p.date}">\n<meta property="article:modified_time" content="${p.updated||p.date}">\n<meta property="article:section" content="${esc(p.cat)}">\n<meta name="keywords" content="${esc(p.keywords.join(', '))}">\n`}));
}

/* trang danh sách */
{
  const url=SITE+'blog/',title='Bài viết: website, AI, video cho doanh nghiệp | Dream Labs';
  const desc='Kinh nghiệm thực tế về tự động hóa quy trình bằng AI, báo giá và thiết kế website, landing page, bao bì, video quảng cáo cho doanh nghiệp Việt Nam.';
  const graph=[org,{'@type':'Blog','@id':url+'#blog',name:'Bài viết của Dream Labs',url,inLanguage:'vi',publisher:{'@id':SITE+'#org'},
      blogPost:posts.map(p=>({'@type':'BlogPosting',headline:p.h1,url:p.url,datePublished:p.date,image:SITE+p.image}))},
    crumbs([['Trang chủ',SITE],['Bài viết',url]])];
  const topics=CATS.map(c=>[c.id,c.name,posts.filter(p=>p.cat_id===c.id).length]).filter(t=>t[2]);
  const main=`<nav class="bl-wrap bl-crumb" aria-label="Đường dẫn"><a href="../">Trang chủ</a><span aria-hidden="true">/</span><span aria-current="page">Bài viết</span></nav>
<header class="bl-wrap bl-list-h"><p class="eyebrow">Bài viết</p><h1>Kinh nghiệm làm <em>website, AI và video</em> cho doanh nghiệp</h1>
 <p class="bl-lead">Những điều nên biết trước khi thuê làm website, landing page, video, bao bì hay tự động hóa quy trình bằng AI: chi phí, quy trình, cách chọn đơn vị làm. Viết từ kinh nghiệm làm nghề của Dream Labs.</p></header>
<section class="bl-wrap bl-list" aria-label="Danh sách bài viết">
 <div class="bl-filter" role="group" aria-label="Lọc theo chủ đề"><button type="button" data-f="" aria-pressed="true">Tất cả <small>${posts.length}</small></button>${topics.map(([id,n,c])=>`<button type="button" data-f="${id}" aria-pressed="false">${esc(n)} <small>${c}</small></button>`).join('')}</div>
 <div class="bl-cards big" data-cards>${posts.map(p=>card(p,'','h2').replace('<article class="bl-card">',`<article class="bl-card" data-c="${p.cat_id}">`)).join('')}</div>
 <nav class="bl-pager" aria-label="Phân trang" hidden></nav>
</section>
<script>(function(){var P=12,list=[].slice.call(document.querySelectorAll('[data-cards] .bl-card')),nav=document.querySelector('.bl-pager'),bs=[].slice.call(document.querySelectorAll('.bl-filter button')),f='',pg=1;
function q(){try{var u=new URLSearchParams(location.search);f=u.get('chu-de')||'';pg=Math.max(1,+u.get('trang')||1)}catch(e){}}
function draw(push){var m=list.filter(function(a){return !f||a.dataset.c===f}),n=Math.max(1,Math.ceil(m.length/P));if(pg>n)pg=n;
 list.forEach(function(a){a.hidden=true});m.slice((pg-1)*P,pg*P).forEach(function(a){a.hidden=false});
 bs.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.f===f))});
 nav.hidden=n<2;nav.innerHTML='';for(var i=1;i<=n;i++){var b=document.createElement('button');b.type='button';b.textContent=i;b.setAttribute('aria-label','Trang '+i);if(i===pg)b.setAttribute('aria-current','page');b.onclick=(function(i){return function(){pg=i;draw(1);document.querySelector('.bl-filter').scrollIntoView({block:'start'})}})(i);nav.appendChild(b)}
 if(push){try{var u=new URLSearchParams();if(f)u.set('chu-de',f);if(pg>1)u.set('trang',pg);history.replaceState(null,'',location.pathname+(u+''?'?'+u:''))}catch(e){}}}
bs.forEach(function(b){b.onclick=function(){f=b.dataset.f;pg=1;draw(1)}});q();draw(0)})();</script>`;
  fs.writeFileSync(path.join(OUT,'index.html'),page({up:'../',cur:'blog',title,desc,canonical:url,image:posts[0].image,imageAlt:'Bài viết của Dream Labs',jsonld:ld({'@context':'https://schema.org','@graph':graph}),main}));
}

/* sitemap */
const today=new Date().toISOString().slice(0,10);
fs.writeFileSync(path.join(R,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${SITE}en/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE}ja/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE}lab/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>${SITE}giai-phap-theo-nganh/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${SITE}blog/</loc><lastmod>${posts.map(p=>p.updated||p.date).sort().pop()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
${S.PAGES.map(p=>`  <url><loc>${SITE}${p.slug}/</loc><lastmod>${p.updated||p.date}</lastmod><changefreq>monthly</changefreq><priority>${p.industry_id?'0.7':p.topic?'0.8':'0.9'}</priority></url>`).join('\n')}
${posts.map(p=>`  <url><loc>${p.url}</loc><lastmod>${p.updated||p.date}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n')}
</urlset>
`);
/* tổng hợp nguồn ảnh bài viết */
{const rows=posts.filter(p=>Object.keys(p.credits).length).flatMap(p=>Object.entries(p.credits).map(([k,c])=>`| [${p.short||p.h1}](${p.url}) | ${k} | ${c.author} | ${c.site} | ${c.page} |`));
 if(rows.length)fs.writeFileSync(path.join(R,'img/blog/CREDITS.md'),`# Nguồn ảnh bài viết\n\nẢnh tải từ Pexels / Unsplash theo giấy phép miễn phí cho mục đích thương mại (https://www.pexels.com/license/ , https://unsplash.com/license). Ảnh có nguồn ghi \"AI\" do Dream Labs tự tạo bằng ComfyUI (mô hình Z-Image Turbo), chỉ để minh họa. Tự sinh bởi tools/blog.js từ img/blog/<slug>/credits.json.\n\n| Bài | Ảnh | Tác giả | Nguồn | Link |\n|---|---|---|---|---|\n${rows.join('\n')}\n`)}
if(require.main===module)console.log('blog:',posts.map(p=>`${p.slug} (${p.words} chữ)`).join(' · '));
module.exports={posts};
