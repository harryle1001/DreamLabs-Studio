/* Phần dùng chung cho các trang phụ (blog/, trang dịch vụ): đọc nguồn, giá từ js/data.js, khung trang (head, header, footer).
   Dùng bởi tools/blog.js và tools/pages.js. */
const fs=require('fs'),path=require('path');
const R=path.join(__dirname,'..'),SITE='https://dreamlabs.vn/';
const rd=f=>fs.readFileSync(path.join(R,f),'utf8');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const strip=s=>String(s).replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const ld=o=>'<script type="application/ld+json">'+JSON.stringify(o).replace(/</g,'\\u003c')+'</script>';
const countWords=html=>strip(html).split(' ').filter(w=>/[\p{L}\p{N}]/u.test(w)).length;

/* giá và liên hệ: lấy từ nguồn chung, không viết tay */
const W={};new Function('window',rd('js/data.js'))(W);const {CATS,STEPS,CMP={}}=W.DL_DATA;
const cat=id=>{const c=CATS.find(x=>x.id===id);if(!c)throw new Error('Không có hạng mục '+id);return c};
const vnd=n=>Math.round(n).toLocaleString('vi-VN')+'đ';
const priceText=t=>vnd(t.p)+(t.u||'')+(t.plus?' trở lên':'');
const contact=rd('src/partials/90-contact.html');
const EMAIL=(contact.match(/<dt>Email<\/dt><dd>([^<]+)<\/dd>/)||[])[1]||'';
const PHONE=(contact.match(/<dt>Zalo \/ Điện thoại<\/dt><dd>([^<]+)<\/dd>/)||[])[1]||'0934 246 420';
const ZALO='https://zalo.me/'+PHONE.replace(/\D/g,'');
const fmtDate=d=>{const [y,m,dd]=d.split('-');return `${+dd} tháng ${+m}, ${y}`};

function priceTable(id){
  const c=cat(id);
  return `<div class="bl-price" role="region" aria-label="Bảng giá ${esc(c.name)}" tabindex="0"><table>
<caption>Bảng giá ${esc(c.name)} tại Dream Labs (chưa gồm VAT)</caption>
<thead><tr><th scope="col">Gói</th><th scope="col">Giá</th><th scope="col">Thời gian</th><th scope="col">Bao gồm</th></tr></thead>
<tbody>${c.tiers.map(t=>`<tr${t.hot?' class="hot"':''}><th scope="row">${esc(t.n)}${t.hot?'<small>Phổ biến nhất</small>':''}</th><td class="p">${priceText(t)}</td><td>${esc(t.t)}<small>${esc(t.r)}</small></td><td>${t.g?`<p class="g">${esc(t.g)}</p>`:''}<ul>${t.f.filter(f=>typeof f==='string').map(f=>`<li>${esc(f)}</li>`).join('')}</ul></td></tr>`).join('\n')}</tbody></table></div>`;
}
/* thẻ gói (trang dịch vụ): tên, giá, thời gian, có / không có */
function tierCards(id,h='h3'){
  const c=cat(id);
  return `<div class="sv-tiers" role="list" aria-label="Các gói ${esc(c.name)}">${c.tiers.map(t=>`<div class="sv-tier${t.hot?' hot':''}" role="listitem">
 <div class="sv-tier-n"><${h}>Gói ${esc(t.n)}</${h}>${t.hot?'<span class="sv-badge">Phổ biến nhất</span>':''}</div>
 <p class="sv-tier-p">${vnd(t.p)}<small>${esc((t.u||'')+(t.plus?' trở lên':''))}</small></p>
 <p class="sv-tier-t">${esc(t.t)} · ${esc(t.r)}</p>
 ${t.g?`<p class="sv-tier-g"><b>Doanh nghiệp được gì</b>${esc(t.g)}</p>`:''}
 <ul>${t.f.map(f=>typeof f==='string'?`<li>${esc(f)}</li>`:`<li class="no"><span class="sr-only">Không gồm: </span>${esc(f.x)}</li>`).join('')}</ul>
</div>`).join('\n')}</div>
<p class="sv-vat">Giá chưa gồm VAT. Báo giá cuối cùng theo phạm vi thống nhất trước khi làm, không phát sinh ngoài phạm vi.</p>`;
}

/* nguồn trang: dòng đầu <!--meta {...} -->, còn lại là thân HTML. Trả về meta + thân thô. */
function readSrc(dir,sub=''){
  const D=path.join(R,dir,sub);if(!fs.existsSync(D))return[];
  return fs.readdirSync(D,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>{
    if(e.isDirectory())return readSrc(dir,sub+e.name+'/');   /* thư mục con: src/pages/thiet-ke-website/spa.html -> /thiet-ke-website/spa/ */
    if(!e.name.endsWith('.html'))return[];
    const raw=fs.readFileSync(path.join(D,e.name),'utf8'),m=raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
    if(!m)throw new Error(dir+'/'+sub+e.name+': thiếu khối <!--meta-->');
    return[{...JSON.parse(m[1]),slug:sub+e.name.replace(/\.html$/,''),raw:raw.slice(m[0].length)}];
  });
}
/* đánh id cho h2 (mục lục) và tách câu hỏi thường gặp (<h2 id="cau-hoi"> rồi các cặp h3 + đoạn) */
function outline(body){
  const toc=[];
  body=body.replace(/<h2(?: id="([^"]+)")?>([\s\S]*?)<\/h2>/g,(_,id,t)=>{id=id||'muc-'+(toc.length+1);toc.push({id,t:strip(t)});return `<h2 id="${id}">${t}</h2>`});
  const faq=[],fi=body.indexOf('<h2 id="cau-hoi">');
  if(fi>=0){const sec=body.slice(fi).split(/<h2 /).slice(0,2).join('<h2 ');for(const q of sec.matchAll(/<h3>([\s\S]*?)<\/h3>\s*([\s\S]*?)(?=<h3>|<h2 |$)/g))faq.push({q:strip(q[1]),a:strip(q[2])})}
  return{body,toc,faq};
}
const checkLen=(slug,title,desc)=>{
  if(title.length>60)console.warn('⚠ title > 60 ký tự:',slug,title.length);
  if(desc.length>160)console.warn('⚠ description > 160 ký tự:',slug,desc.length);
};

/* danh sách trang để dựng menu, chân trang, sitemap */
const POSTS=readSrc('src/blog').sort((a,b)=>b.date.localeCompare(a.date)||(a.order||0)-(b.order||0));
const PAGES=readSrc('src/pages').sort((a,b)=>(a.order||0)-(b.order||0));
const HUBS=PAGES.filter(p=>!p.industry_id);              /* trang dịch vụ chính (không phải trang theo ngành) */
const INDUSTRY=PAGES.filter(p=>p.industry_id);             /* trang dịch vụ theo ngành: meta industry_id + industry */
const pageFor=id=>HUBS.find(p=>p.cat_id===id);   /* trang dịch vụ riêng của một hạng mục (nếu có) */
const upOf=slug=>'../'.repeat(slug.split('/').length);
const svcHref=(id,up)=>{const p=pageFor(id);return p?`${up}${p.slug}/`:`${up}#p-${id}`};

const ICON={arrow:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  logo:'<svg viewBox="0 0 26 26" aria-hidden="true"><defs><linearGradient id="bl-lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--lav)"/><stop offset=".62" style="stop-color:var(--peach)"/><stop offset="1" style="stop-color:var(--mist)"/></linearGradient></defs><circle cx="13" cy="13" r="12" fill="url(#bl-lg)"/><path d="M17 6.5a7.5 7.5 0 1 0 2.5 10.6A6 6 0 0 1 17 6.5z" style="fill:var(--paper)" opacity=".85"/></svg>',
  theme:'<svg viewBox="0 0 26 26" aria-hidden="true"><g class="sun"><circle cx="13" cy="13" r="4.6"/><path d="M13 3v2.4M13 20.6V23M3 13h2.4M20.6 13H23M5.9 5.9l1.7 1.7M18.4 18.4l1.7 1.7M5.9 20.1l1.7-1.7M18.4 7.6l1.7-1.7"/></g><path class="moon" d="M19.6 15.4A7.6 7.6 0 0 1 10.6 6.4a7.6 7.6 0 1 0 9 9z"/></svg>',
  zalo:'<svg viewBox="0 0 26 26" aria-hidden="true"><path d="M13 4.2c-5.2 0-9.4 3.5-9.4 7.9 0 2.5 1.4 4.7 3.5 6.2l-.8 3.5 3.8-2.1c.9.2 1.9.3 2.9.3 5.2 0 9.4-3.5 9.4-7.9S18.2 4.2 13 4.2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>'};
const CSS=['css/fonts.css','css/tokens.css','css/base.css','css/blog.css'];
const org={'@type':'Organization','@id':SITE+'#org',name:'Dream Labs',url:SITE,logo:SITE+'img/icon-512.png'};
const crumbs=list=>({'@type':'BreadcrumbList',itemListElement:list.map(([name,item],i)=>({'@type':'ListItem',position:i+1,name,item}))});
const faqLd=(url,faq)=>({'@type':'FAQPage','@id':url+'#cau-hoi',mainEntity:faq.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))});

/* khung trang. up: đường dẫn về gốc ('../' hoặc '../../'); cur: khóa mục menu đang mở */
function page({up,cur='',title,desc,canonical,ogType='website',image,imageAlt,jsonld,main,extraHead=''}){
  const nav=[...HUBS.filter(p=>p.nav).map(p=>[p.slug,p.nav,up+p.slug+'/']),['blog','Bài viết',up+'blog/'],['lien-he','Liên hệ',up+'#lien-he']];
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
   ${nav.map(([k,t,h])=>`<a href="${h}"${k===cur?' aria-current="page"':''}>${esc(t)}</a>`).join('')}
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
  <nav aria-label="Dịch vụ"><b>Dịch vụ</b>${CATS.map(c=>`<a href="${svcHref(c.id,up)}">${esc((pageFor(c.id)||{}).short||c.name)}</a>`).join('')}${HUBS.filter(p=>!p.cat_id).map(p=>`<a href="${up}${p.slug}/">${esc(p.short||p.h1)}</a>`).join('')}</nav>
  <nav aria-label="Bài viết"><b>Bài viết</b>${POSTS.map(p=>`<a href="${up}blog/${p.slug}/">${esc(p.short||p.h1)}</a>`).join('')}</nav>
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

module.exports={R,SITE,rd,esc,strip,ld,countWords,CATS,STEPS,CMP,cat,vnd,priceText,EMAIL,PHONE,ZALO,fmtDate,priceTable,tierCards,readSrc,outline,checkLen,POSTS,PAGES,HUBS,INDUSTRY,upOf,pageFor,svcHref,ICON,org,crumbs,faqLd,page};
