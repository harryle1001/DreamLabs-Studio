#!/usr/bin/env node
/* Dựng mục Bài viết: node tools/blog.js
   Nguồn: src/blog/<slug>.html — dòng đầu là chú thích <!--meta {...} --> (JSON), phần còn lại là thân bài HTML.
     Trong thân bài: {{gia:<id>}} chèn bảng giá lấy từ js/data.js (luôn khớp bảng giá trang chủ).
     Mục "Câu hỏi thường gặp": <h2 id="cau-hoi">…</h2> rồi các cặp <h3>câu hỏi</h3><p>trả lời</p> (tự sinh FAQPage JSON-LD).
   Kết quả: blog/index.html, blog/<slug>/index.html, src/partials/70-blog.html (khối "Bài viết mới" trên trang chủ), sitemap.xml.
   build.js tự gọi file này nên thường không cần chạy riêng. */
const fs=require('fs'),path=require('path');
const R=path.join(__dirname,'..'),SITE='https://dreamlabs.vn/',SRC=path.join(R,'src/blog'),OUT=path.join(R,'blog');
const rd=f=>fs.readFileSync(path.join(R,f),'utf8');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const strip=s=>String(s).replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const ld=o=>'<script type="application/ld+json">'+JSON.stringify(o).replace(/</g,'\\u003c')+'</script>';

/* giá và liên hệ: lấy từ nguồn chung, không viết tay */
const W={};new Function('window',rd('js/data.js'))(W);const CATS=W.DL_DATA.CATS;
const vnd=n=>Math.round(n).toLocaleString('vi-VN')+'đ';
const contact=rd('src/partials/90-contact.html');
const EMAIL=(contact.match(/<dt>Email<\/dt><dd>([^<]+)<\/dd>/)||[])[1]||'';
const PHONE=(contact.match(/<dt>Zalo \/ Điện thoại<\/dt><dd>([^<]+)<\/dd>/)||[])[1]||'0934 246 420';
const ZALO='https://zalo.me/'+PHONE.replace(/\D/g,'');
const fmtDate=d=>{const [y,m,dd]=d.split('-');return `${+dd} tháng ${+m}, ${y}`};

function priceTable(id){
  const c=CATS.find(x=>x.id===id);if(!c)throw new Error('Không có hạng mục '+id);
  return `<div class="bl-price" role="region" aria-label="Bảng giá ${esc(c.name)}" tabindex="0"><table>
<caption>Bảng giá ${esc(c.name)} tại Dream Labs (chưa gồm VAT)</caption>
<thead><tr><th scope="col">Gói</th><th scope="col">Giá</th><th scope="col">Thời gian</th><th scope="col">Bao gồm</th></tr></thead>
<tbody>${c.tiers.map(t=>`<tr${t.hot?' class="hot"':''}><th scope="row">${esc(t.n)}${t.hot?'<small>Phổ biến nhất</small>':''}</th><td class="p">${vnd(t.p)}${t.u?esc(t.u):''}${t.plus?' trở lên':''}</td><td>${esc(t.t)}<small>${esc(t.r)}</small></td><td><ul>${t.f.filter(f=>typeof f==='string').map(f=>`<li>${esc(f)}</li>`).join('')}</ul></td></tr>`).join('\n')}</tbody></table></div>`;
}

/* đọc bài */
const posts=fs.readdirSync(SRC).filter(f=>f.endsWith('.html')).map(f=>{
  const raw=fs.readFileSync(path.join(SRC,f),'utf8'),m=raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if(!m)throw new Error(f+': thiếu khối <!--meta-->');
  const meta=JSON.parse(m[1]),slug=f.replace(/\.html$/,'');
  let body=raw.slice(m[0].length).replace(/\{\{gia:(\w+)\}\}/g,(_,id)=>priceTable(id));
  const toc=[];
  body=body.replace(/<h2(?: id="([^"]+)")?>([\s\S]*?)<\/h2>/g,(_,id,t)=>{id=id||'muc-'+(toc.length+1);toc.push({id,t:strip(t)});return `<h2 id="${id}">${t}</h2>`});
  const faq=[],fi=body.indexOf('<h2 id="cau-hoi">');
  if(fi>=0){const sec=body.slice(fi).split(/<h2 /).slice(0,2).join('<h2 ');for(const q of sec.matchAll(/<h3>([\s\S]*?)<\/h3>\s*([\s\S]*?)(?=<h3>|<h2 |$)/g))faq.push({q:strip(q[1]),a:strip(q[2])})}
  const words=strip(body.replace(/<table[\s\S]*?<\/table>/g,'')).split(' ').filter(w=>/[\p{L}\p{N}]/u.test(w)).length;
  return{...meta,slug,body,toc,faq,words,read:Math.max(1,Math.round(words/200)),url:SITE+'blog/'+slug+'/'};
}).sort((a,b)=>b.date.localeCompare(a.date)||(a.order||0)-(b.order||0));
for(const p of posts){
  if(p.title.length>60)console.warn('⚠ title > 60 ký tự:',p.slug,p.title.length);
  if(p.description.length>160)console.warn('⚠ description > 160 ký tự:',p.slug,p.description.length);
}

/* khung chung */
const ICON={arrow:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  logo:'<svg viewBox="0 0 26 26" aria-hidden="true"><defs><linearGradient id="bl-lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--lav)"/><stop offset=".62" style="stop-color:var(--peach)"/><stop offset="1" style="stop-color:var(--mist)"/></linearGradient></defs><circle cx="13" cy="13" r="12" fill="url(#bl-lg)"/><path d="M17 6.5a7.5 7.5 0 1 0 2.5 10.6A6 6 0 0 1 17 6.5z" style="fill:var(--paper)" opacity=".85"/></svg>',
  theme:'<svg viewBox="0 0 26 26" aria-hidden="true"><g class="sun"><circle cx="13" cy="13" r="4.6"/><path d="M13 3v2.4M13 20.6V23M3 13h2.4M20.6 13H23M5.9 5.9l1.7 1.7M18.4 18.4l1.7 1.7M5.9 20.1l1.7-1.7M18.4 7.6l1.7-1.7"/></g><path class="moon" d="M19.6 15.4A7.6 7.6 0 0 1 10.6 6.4a7.6 7.6 0 1 0 9 9z"/></svg>',
  zalo:'<svg viewBox="0 0 26 26" aria-hidden="true"><path d="M13 4.2c-5.2 0-9.4 3.5-9.4 7.9 0 2.5 1.4 4.7 3.5 6.2l-.8 3.5 3.8-2.1c.9.2 1.9.3 2.9.3 5.2 0 9.4-3.5 9.4-7.9S18.2 4.2 13 4.2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>'};
const CSS=['css/fonts.css','css/tokens.css','css/base.css','css/blog.css'];
function page({up,title,desc,canonical,ogType='website',image,imageAlt,jsonld,main,extraHead=''}){
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#F4EFE6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#15121C" media="(prefers-color-scheme: dark)">
<meta name="format-detection" content="telephone=no">
<link rel="icon" type="image/png" href="${up}img/icon-192.png">
<link rel="apple-touch-icon" href="${up}img/icon-180.png">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="Dream Labs">
<meta property="og:locale" content="vi_VN">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}${image}">
<meta property="og:image:alt" content="${esc(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
${extraHead}<script>try{var t=localStorage.getItem('dl-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
${CSS.map(c=>`<link rel="stylesheet" href="${up}${c}">`).join('\n')}
${jsonld}
</head>
<body class="bl">
<a class="bl-skip" href="#noi-dung">Bỏ qua tới nội dung</a>
<header class="bl-head">
 <div class="bl-wrap bl-head-in">
  <a class="bl-logo" href="${up}" aria-label="Dream Labs, trang chủ">${ICON.logo}<span>Dream <i>Labs</i></span></a>
  <nav class="bl-nav" aria-label="Chính">
   <a href="${up}#bao-gia">Bảng giá</a><a href="${up}#tu-dong-hoa">Tự động hóa AI</a><a href="${up}blog/" aria-current="${up==='../'?'page':'false'}">Bài viết</a><a href="${up}#lien-he">Liên hệ</a>
  </nav>
  <div class="bl-act">
   <button class="bl-ib" type="button" data-theme-toggle aria-label="Đổi giao diện sáng hoặc tối">${ICON.theme}</button>
   <a class="btn primary sm bl-zalo" href="${ZALO}" target="_blank" rel="noopener">${ICON.zalo}<span>Zalo ${esc(PHONE)}</span></a>
  </div>
 </div>
</header>
<main id="noi-dung">
${main}
</main>
<footer class="bl-foot">
 <div class="bl-wrap bl-foot-in">
  <div class="bl-foot-brand"><a class="bl-logo" href="${up}">${ICON.logo}<span>Dream <i>Labs</i></span></a>
   <p>Tự động hóa quy trình doanh nghiệp bằng AI, thiết kế website, landing page, video, bao bì cho doanh nghiệp Việt Nam.</p></div>
  <nav aria-label="Dịch vụ"><b>Dịch vụ</b>${CATS.map(c=>`<a href="${up}#p-${c.id}">${esc(c.name)}</a>`).join('')}</nav>
  <nav aria-label="Bài viết"><b>Bài viết</b>${posts.map(p=>`<a href="${up}blog/${p.slug}/">${esc(p.short||p.h1)}</a>`).join('')}</nav>
  <div><b>Liên hệ</b><span class="sel">${esc(PHONE)}</span>${EMAIL?`<span class="sel">${esc(EMAIL)}</span>`:''}<a href="${ZALO}" target="_blank" rel="noopener">Nhắn Zalo</a><span>T2–T7 · 8:30–18:00</span><span>TP. Hồ Chí Minh</span></div>
 </div>
 <div class="bl-wrap bl-foot-bot"><span>© 2026 Dream Labs</span><a href="${up}">dreamlabs.vn</a></div>
</footer>
<script>(function(){var c=document.querySelector('.bl-toc details');if(c&&innerWidth<1024)c.open=false;var r=document.documentElement,m=matchMedia('(prefers-color-scheme: dark)');function d(){return r.dataset.theme?r.dataset.theme==='dark':m.matches}
document.querySelectorAll('[data-theme-toggle]').forEach(function(b){b.setAttribute('aria-pressed',String(d()));b.addEventListener('click',function(){var t=d()?'light':'dark';r.dataset.theme=t;try{localStorage.setItem('dl-theme',t)}catch(e){}b.setAttribute('aria-pressed',String(t==='dark'))})})})();</script>
</body>
</html>
`;
}
const org={'@type':'Organization','@id':SITE+'#org',name:'Dream Labs',url:SITE,logo:SITE+'img/icon-512.png'};
const card=(p,up,h='h2')=>`<article class="bl-card"><a href="${up}${p.slug}/"><span class="bl-card-img"><img src="${up}../${p.image}" width="1280" height="791" alt="${esc(p.imageAlt)}" loading="lazy" decoding="async"></span>
 <span class="bl-card-t"><small>${esc(p.cat)}</small><${h}>${esc(p.h1)}</${h}><span class="bl-card-d">${esc(p.description)}</span><span class="bl-card-m">${fmtDate(p.date)} · ${p.read} phút đọc</span></span></a></article>`;

/* trang từng bài */
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
for(const p of posts){
  const up='../../',cat=CATS.find(c=>c.id===p.cat_id);
  const related=(p.related||[]).map(s=>posts.find(x=>x.slug===s)).filter(Boolean).concat(posts.filter(x=>x!==p&&!(p.related||[]).includes(x.slug))).slice(0,3);
  const graph=[org,
    {'@type':'BlogPosting','@id':p.url+'#bai',headline:p.h1,description:p.description,inLanguage:'vi',url:p.url,mainEntityOfPage:p.url,
     image:SITE+p.image,datePublished:p.date,dateModified:p.updated||p.date,wordCount:p.words,keywords:p.keywords.join(', '),articleSection:p.cat,
     author:{'@id':SITE+'#org'},publisher:{'@id':SITE+'#org'}},
    {'@type':'BreadcrumbList',itemListElement:[{name:'Trang chủ',item:SITE},{name:'Bài viết',item:SITE+'blog/'},{name:p.h1,item:p.url}].map((x,i)=>({'@type':'ListItem',position:i+1,...x}))}];
  if(p.faq.length)graph.push({'@type':'FAQPage','@id':p.url+'#cau-hoi',mainEntity:p.faq.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))});
  const toc=`<ol>${p.toc.map(t=>`<li><a href="#${t.id}">${esc(t.t)}</a></li>`).join('')}</ol>`;
  const main=`<nav class="bl-wrap bl-crumb" aria-label="Đường dẫn"><a href="${up}">Trang chủ</a><span aria-hidden="true">/</span><a href="../">Bài viết</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.short||p.h1)}</span></nav>
<article class="bl-post">
 <header class="bl-wrap bl-post-h">
  <p class="eyebrow">${esc(p.cat)}</p>
  <h1>${p.h1html||esc(p.h1)}</h1>
  <p class="bl-lead">${esc(p.lead||p.description)}</p>
  <p class="bl-meta"><span>Dream Labs</span><time datetime="${p.date}">${fmtDate(p.date)}</time><span>${p.read} phút đọc</span></p>
 </header>
 <figure class="bl-wrap bl-hero"><img src="${up}${p.image}" width="1280" height="791" alt="${esc(p.imageAlt)}" fetchpriority="high" decoding="async"><figcaption>${esc(p.imageCaption||p.imageAlt)}</figcaption></figure>
 <div class="bl-wrap bl-grid">
  <aside class="bl-toc" aria-label="Mục lục"><details open><summary>Mục lục</summary>${toc}</details></aside>
  <div class="bl-body">
${p.body.trim()}
   <section class="bl-cta" aria-label="Liên hệ Dream Labs">
    <p class="eyebrow">Bắt đầu cùng Dream Labs</p>
    <h2 class="bl-cta-h">${esc(p.ctaTitle||'Cần tư vấn cho trường hợp của bạn?')}</h2>
    <p>${esc(p.ctaText||'Nhắn Zalo để được tư vấn miễn phí, hoặc xem bảng giá chi tiết từng gói trên trang chủ.')}</p>
    <div class="bl-cta-act"><a class="btn primary" href="${SITE}#p-${cat.id}">Xem gói ${esc(cat.name)} ${ICON.arrow}</a><a class="btn" href="${SITE}#bao-gia">Toàn bộ bảng giá</a><a class="btn" href="${ZALO}" target="_blank" rel="noopener">Zalo ${esc(PHONE)}</a></div>
   </section>
  </div>
 </div>
</article>
<section class="bl-wrap bl-more" aria-labelledby="bl-more-h"><h2 id="bl-more-h">Bài viết liên quan</h2><div class="bl-cards">${related.map(r=>card(r,'../','h3')).join('')}</div></section>`;
  const dir=path.join(OUT,p.slug);fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),page({up,title:p.title,desc:p.description,canonical:p.url,ogType:'article',image:p.image,imageAlt:p.imageAlt,jsonld:ld({'@context':'https://schema.org','@graph':graph}),main,
    extraHead:`<meta property="article:published_time" content="${p.date}">\n<meta property="article:modified_time" content="${p.updated||p.date}">\n<meta property="article:section" content="${esc(p.cat)}">\n<meta name="keywords" content="${esc(p.keywords.join(', '))}">\n`}));
}

/* trang danh sách */
{
  const url=SITE+'blog/',title='Bài viết: website, AI, video cho doanh nghiệp | Dream Labs';
  const desc='Kinh nghiệm thực tế về tự động hóa quy trình bằng AI, báo giá và thiết kế website, landing page, bao bì, video quảng cáo cho doanh nghiệp Việt Nam.';
  const graph=[org,{'@type':'Blog','@id':url+'#blog',name:'Bài viết của Dream Labs',url,inLanguage:'vi',publisher:{'@id':SITE+'#org'},
      blogPost:posts.map(p=>({'@type':'BlogPosting',headline:p.h1,url:p.url,datePublished:p.date,image:SITE+p.image}))},
    {'@type':'BreadcrumbList',itemListElement:[{name:'Trang chủ',item:SITE},{name:'Bài viết',item:url}].map((x,i)=>({'@type':'ListItem',position:i+1,...x}))}];
  const main=`<nav class="bl-wrap bl-crumb" aria-label="Đường dẫn"><a href="../">Trang chủ</a><span aria-hidden="true">/</span><span aria-current="page">Bài viết</span></nav>
<header class="bl-wrap bl-list-h"><p class="eyebrow">Bài viết</p><h1>Kinh nghiệm làm <em>website, AI và video</em> cho doanh nghiệp</h1>
 <p class="bl-lead">Những điều nên biết trước khi thuê làm website, landing page, video, bao bì hay tự động hóa quy trình bằng AI: chi phí, quy trình, cách chọn đơn vị làm. Viết từ kinh nghiệm làm nghề của Dream Labs.</p></header>
<section class="bl-wrap bl-list" aria-label="Danh sách bài viết"><div class="bl-cards big">${posts.map(p=>card(p,'','h2')).join('')}</div></section>`;
  fs.writeFileSync(path.join(OUT,'index.html'),page({up:'../',title,desc,canonical:url,image:posts[0].image,imageAlt:'Bài viết của Dream Labs',jsonld:ld({'@context':'https://schema.org','@graph':graph}),main}));
}

/* khối "Bài viết mới" trên trang chủ */
const home=posts.filter(p=>p.home!==false).slice(0,3);
fs.writeFileSync(path.join(R,'src/partials/70-blog.html'),`<!-- Sinh tự động bởi tools/blog.js: đừng sửa tay -->
<section class="band bposts-sec" id="bai-viet">
  <div class="wrap">
    <div class="bposts-head"><div><p class="eyebrow">Bài viết mới</p><h2>Kinh nghiệm <em>trước khi bắt đầu.</em></h2></div>
      <a class="btn sm" href="blog/">Tất cả bài viết <svg viewBox="0 0 16 16" aria-hidden="true"><use href="#dl-arrow"/></svg></a></div>
    <div class="bposts">
${home.map(p=>`      <a class="bpost" href="blog/${p.slug}/" data-cursor="Đọc"><span class="bpost-img"><img src="${p.image}" width="1280" height="791" alt="${esc(p.imageAlt)}" loading="lazy" decoding="async"></span><span class="bpost-t"><small>${esc(p.cat)} · ${p.read} phút đọc</small><b>${esc(p.h1)}</b></span></a>`).join('\n')}
    </div>
  </div>
</section>
`);

/* sitemap */
const today=new Date().toISOString().slice(0,10);
fs.writeFileSync(path.join(R,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${SITE}blog/</loc><lastmod>${posts.map(p=>p.updated||p.date).sort().pop()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
${posts.map(p=>`  <url><loc>${p.url}</loc><lastmod>${p.updated||p.date}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n')}
</urlset>
`);
if(require.main===module)console.log('blog:',posts.map(p=>`${p.slug} (${p.words} chữ)`).join(' · '));
module.exports={posts};
