#!/usr/bin/env node
/* Dựng các trang dịch vụ: node tools/pages.js  (build.js tự gọi)
   Nguồn: src/pages/<slug>.html — dòng đầu <!--meta {...} --> (JSON), còn lại là thân trang HTML. Kết quả: <slug>/index.html.
   Meta: title, h1 (h1html tùy chọn), description, lead, eyebrow, cat_id (hạng mục trong js/data.js; bỏ trống = trang tổng hợp),
         cats (danh sách hạng mục cho JSON-LD trang tổng hợp), nav (nhãn trên menu), short (nhãn ở chân trang), order,
         image, imageAlt, imageCaption, keywords, related (slug bài viết), date, updated, ctaTitle, ctaText.
   Mã chèn trong thân trang (lấy từ js/data.js nên luôn khớp bảng giá trang chủ):
     {{goi:<id>}}     thẻ các gói: giá, thời gian, có / không có
     {{gia:<id>}}     bảng giá dạng bảng
     {{so-sanh:<id>}} bảng so sánh chi tiết giữa các gói
     {{tu:<id>}}      giá thấp nhất của hạng mục, ví dụ 5.000.000đ
     {{p:<id>:<i>}}   giá gói thứ i (từ 0)
   Câu hỏi thường gặp: <h2 id="cau-hoi">…</h2> rồi các cặp <h3>câu hỏi</h3><p>trả lời</p> (tự sinh FAQPage JSON-LD).
   Khung trang, menu, chân trang dùng chung với blog: tools/site.js. */
const fs=require('fs'),path=require('path');
const S=require('./site.js');
const {R,SITE,esc,strip,ld,countWords,CATS,cat,vnd,priceText,ZALO,PHONE,priceTable,tierCards,outline,checkLen,org,crumbs,faqLd,page,POSTS,PAGES,svcHref,ICON}=S;

function compare(id){
  const c=cat(id),rows=S.CMP[id];
  if(!rows)throw new Error('Không có bảng so sánh '+id);
  const cell=v=>v===1?'<span aria-label="Có">✓</span>':v===0?'<span class="sv-no" aria-label="Không">–</span>':esc(v);
  return `<div class="bl-table sv-cmp" role="region" aria-label="So sánh các gói ${esc(c.name)}" tabindex="0"><table>
<thead><tr><th scope="col">Hạng mục</th>${c.tiers.map(t=>`<th scope="col">${esc(t.n)}</th>`).join('')}</tr></thead>
<tbody>${rows.map(r=>`<tr><th scope="row">${esc(r[0])}</th>${r.slice(1,c.tiers.length+1).map(v=>`<td>${cell(v)}</td>`).join('')}</tr>`).join('\n')}</tbody></table></div>`;
}
const fill=s=>s
  .replace(/\{\{goi:(\w+)\}\}/g,(_,id)=>tierCards(id))
  .replace(/\{\{gia:(\w+)\}\}/g,(_,id)=>priceTable(id))
  .replace(/\{\{so-sanh:(\w+)\}\}/g,(_,id)=>compare(id))
  .replace(/\{\{tu:(\w+)\}\}/g,(_,id)=>vnd(Math.min(...cat(id).tiers.map(t=>t.p))))
  .replace(/\{\{p:(\w+):(\d)\}\}/g,(_,id,i)=>priceText(cat(id).tiers[+i]));
const service=(c,url)=>({'@type':'Service','@id':url+'#'+c.id,name:c.name,serviceType:c.name,description:c.desc,url,
  provider:{'@id':SITE+'#org'},areaServed:{'@type':'Country',name:'Việt Nam'},
  offers:c.tiers.map(t=>({'@type':'Offer',name:c.name+' — Gói '+t.n,price:t.p,priceCurrency:'VND',url,
    ...(t.plus||t.u?{priceSpecification:{'@type':'UnitPriceSpecification',price:t.p,priceCurrency:'VND',...(t.plus?{minPrice:t.p}:{}),...(t.u?{unitText:t.u.replace('/','')}:{})}}:{}),
    description:t.f.filter(f=>typeof f==='string').join('; ')}))});

const built=[];
for(const m of PAGES){
  const url=SITE+m.slug+'/',up='../',c=m.cat_id?cat(m.cat_id):null;
  const words=countWords(m.raw.replace(/\{\{[^}]+\}\}/g,''));
  const {body,toc,faq}=outline(fill(m.raw));
  checkLen(m.slug,m.title,m.description);
  const graph=[{...org,telephone:'+84'+PHONE.replace(/\D/g,'').replace(/^0/,'')},
    {'@type':'WebPage','@id':url+'#trang',url,name:m.title,description:m.description,inLanguage:'vi',isPartOf:{'@type':'WebSite','@id':SITE+'#web'},
     primaryImageOfPage:SITE+m.image,dateModified:m.updated||m.date},
    ...(c?[service(c,url)]:(m.cats||CATS.map(x=>x.id)).map(id=>service(cat(id),url))),
    crumbs([['Trang chủ',SITE],[m.short||m.h1,url]])];
  if(faq.length)graph.push(faqLd(url,faq));
  const related=(m.related||[]).map(s=>POSTS.find(p=>p.slug===s)).filter(Boolean);
  const others=PAGES.filter(p=>p!==m);
  const from=c?Math.min(...c.tiers.map(t=>t.p)):0,fast=c?c.tiers[0].t:'';
  const act=`<a class="btn primary" href="${ZALO}" target="_blank" rel="noopener">${ICON.zalo} Nhắn Zalo ${esc(PHONE)}</a><a class="btn" href="${up}#lien-he">Gửi yêu cầu tư vấn</a><a class="btn" href="${up}#bao-gia">Xem mẫu đã làm ${ICON.arrow}</a>`;
  const main=`<nav class="bl-wrap bl-crumb" aria-label="Đường dẫn"><a href="${up}">Trang chủ</a><span aria-hidden="true">/</span><span aria-current="page">${esc(m.short||m.h1)}</span></nav>
<article class="bl-post sv">
 <header class="bl-wrap bl-post-h sv-h">
  <p class="eyebrow">${esc(m.eyebrow||'Dịch vụ')}</p>
  <h1>${m.h1html||esc(m.h1)}</h1>
  <p class="bl-lead">${esc(m.lead||m.description)}</p>
  ${c?`<ul class="sv-facts" aria-label="Tóm tắt"><li><small>Giá từ</small><b>${vnd(from)}</b></li><li><small>Thời gian từ</small><b>${esc(fast)}</b></li><li><small>Số gói</small><b>${c.tiers.length} gói</b></li></ul>`:''}
  <div class="bl-cta-act sv-act">${act}</div>
 </header>
 <figure class="bl-wrap bl-hero"><img src="${up}${m.image}" width="1280" height="791" alt="${esc(m.imageAlt)}" fetchpriority="high" decoding="async"><figcaption>${esc(m.imageCaption||m.imageAlt)}</figcaption></figure>
 <div class="bl-wrap bl-grid">
  <aside class="bl-toc" aria-label="Mục lục"><details open><summary>Mục lục</summary><ol>${toc.map(t=>`<li><a href="#${t.id}">${esc(t.t)}</a></li>`).join('')}</ol></details></aside>
  <div class="bl-body">
${body.trim()}
   <section class="bl-cta" aria-label="Liên hệ Dream Labs">
    <p class="eyebrow">Bắt đầu cùng Dream Labs</p>
    <h2 class="bl-cta-h">${esc(m.ctaTitle||'Cần tư vấn cho trường hợp của bạn?')}</h2>
    <p>${esc(m.ctaText||'Nhắn Zalo để được tư vấn miễn phí, phản hồi trong 24 giờ.')}</p>
    <div class="bl-cta-act">${act}</div>
   </section>
  </div>
 </div>
</article>
<section class="bl-wrap bl-more" aria-labelledby="sv-more-h"><h2 id="sv-more-h">Dịch vụ khác của Dream Labs</h2>
 <ul class="sv-links">${others.map(p=>`<li><a href="${up}${p.slug}/"><b>${esc(p.short||p.h1)}</b><span>${esc(p.cat_id?'Giá từ '+vnd(Math.min(...cat(p.cat_id).tiers.map(t=>t.p))):'Giá của cả 6 dịch vụ')}</span>${ICON.arrow}</a></li>`).join('')}${CATS.filter(x=>!S.pageFor(x.id)&&x.id!==m.cat_id).map(x=>`<li><a href="${up}#p-${x.id}"><b>${esc(x.name)}</b><span>Giá từ ${vnd(Math.min(...x.tiers.map(t=>t.p)))}</span>${ICON.arrow}</a></li>`).join('')}</ul>
</section>
${related.length?`<section class="bl-wrap bl-more sv-posts" aria-labelledby="sv-posts-h"><h2 id="sv-posts-h">Bài viết nên đọc</h2><div class="bl-cards">${related.map(p=>`<article class="bl-card"><a href="${up}blog/${p.slug}/"><span class="bl-card-img"><img src="${up}${p.image}" width="1280" height="791" alt="${esc(p.imageAlt)}" loading="lazy" decoding="async"></span>
 <span class="bl-card-t"><small>${esc(p.cat)}</small><h3>${esc(p.h1)}</h3><span class="bl-card-d">${esc(p.description)}</span></span></a></article>`).join('')}</div></section>`:''}`;
  const dir=path.join(R,m.slug);fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),page({up,cur:m.slug,title:m.title,desc:m.description,canonical:url,image:m.image,imageAlt:m.imageAlt,
    jsonld:ld({'@context':'https://schema.org','@graph':graph}),main,extraHead:m.keywords?`<meta name="keywords" content="${esc(m.keywords.join(', '))}">\n`:''}));
  built.push(`${m.slug} (${words} chữ)`);
}
if(require.main===module)console.log('trang dịch vụ:',built.join(' · '));
module.exports={pages:PAGES.map(p=>p.slug)};
