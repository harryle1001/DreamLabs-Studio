#!/usr/bin/env node
/* Dựng các trang dịch vụ: node tools/pages.js  (build.js tự gọi)
   Nguồn: src/pages/<slug>.html — dòng đầu <!--meta {...} --> (JSON), còn lại là thân trang HTML. Kết quả: <slug>/index.html.
   Trang theo ngành: src/pages/<trang dịch vụ>/<ngành>.html -> /<trang dịch vụ>/<ngành>/, meta thêm industry_id (khóa ngành, dùng nối các dịch vụ
     cùng ngành) và industry (tên ngành hiển thị). Mỗi lần dựng tự kiểm tra số chữ, chữ cấm, ảnh, liên kết nội bộ.
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
const {R,SITE,esc,strip,ld,countWords,CATS,cat,vnd,priceText,ZALO,PHONE,priceTable,tierCards,outline,checkLen,org,crumbs,faqLd,page,POSTS,PAGES,HUBS,INDUSTRY,upOf,svcHref,ICON}=S;
const fromPrice=id=>vnd(Math.min(...cat(id).tiers.map(t=>t.p)));
/* ô liên kết: [href, tiêu đề, dòng phụ] */
const links=(up,list)=>`<ul class="sv-links">${list.map(([h,b,t])=>`<li><a href="${h.startsWith('#')?up+h:h.startsWith('http')?h:up+h}"><b>${esc(b)}</b><span>${esc(t)}</span>${ICON.arrow}</a></li>`).join('')}</ul>`;
const hubOf=m=>m.industry_id?S.pageFor(m.cat_id):null;
const hubLink=id=>{const h=S.pageFor(id);return h?[h.slug+'/',h.short||h.h1]:['#p-'+id,cat(id).name]};

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
/* {{nganh:<id>}}: danh sách trang theo ngành của một dịch vụ; up tùy độ sâu trang đang dựng */
const fillUp=(s,up)=>s.replace(/\{\{nganh:(\w+)\}\}/g,(_,id)=>links(up,INDUSTRY.filter(p=>p.cat_id===id).map(p=>[p.slug+'/',p.industry,p.short||p.h1])));

/* kiểm tra: số chữ, độ dài, chữ cấm, ảnh, liên kết nội bộ */
const BAN=/tỷ lệ vàng|tỉ lệ vàng|góc vàng|xoắn ốc vàng|φ|1[.,]618|golden/i;
const known=new Set(['',...PAGES.map(p=>p.slug),'blog',...POSTS.map(p=>'blog/'+p.slug)]);
function lint(m,words){
  const w=[];
  if(m.industry_id&&(words<800||words>1300))w.push(`số chữ ${words} (cần 800–1300)`);
  if(BAN.test(m.raw)||BAN.test(JSON.stringify({...m,raw:''})))w.push('có chữ cấm (tỷ lệ vàng / φ / 1.618)');
  if(!fs.existsSync(path.join(R,m.image)))w.push('không có ảnh '+m.image);
  for(const [,h] of m.raw.matchAll(/href="([^"]+)"/g)){
    if(/^(https?:|mailto:|tel:|#)/.test(h))continue;
    const t=path.posix.normalize('/'+m.slug+'/'+h.split('#')[0]).replace(/^\/|\/$/g,'');
    if(!known.has(t)&&!fs.existsSync(path.join(R,t)))w.push('liên kết hỏng '+h);
  }
  if((m.raw.match(/<h1/g)||[]).length)w.push('không đặt <h1> trong thân trang');
  for(const x of w)console.warn('⚠',m.slug+':',x);
  return w.length;
}
const service=(c,url)=>({'@type':'Service','@id':url+'#'+c.id,name:c.name,serviceType:c.name,description:c.desc,url,
  provider:{'@id':SITE+'#org'},areaServed:{'@type':'Country',name:'Việt Nam'},
  offers:c.tiers.map(t=>({'@type':'Offer',name:c.name+' — Gói '+t.n,price:t.p,priceCurrency:'VND',url,
    ...(t.plus||t.u?{priceSpecification:{'@type':'UnitPriceSpecification',price:t.p,priceCurrency:'VND',...(t.plus?{minPrice:t.p}:{}),...(t.u?{unitText:t.u.replace('/','')}:{})}}:{}),
    description:t.f.filter(f=>typeof f==='string').join('; ')}))});

const built=[];let bad=0;
for(const m of PAGES){
  const url=SITE+m.slug+'/',up=upOf(m.slug),c=m.cat_id?cat(m.cat_id):null,hub=hubOf(m);
  const words=countWords(m.raw.replace(/\{\{[^}]+\}\}/g,''));
  bad+=lint(m,words);
  const {body,toc,faq}=outline(fillUp(fill(m.raw),up));
  checkLen(m.slug,m.title,m.description);
  const graph=[{...org,telephone:'+84'+PHONE.replace(/\D/g,'').replace(/^0/,'')},
    {'@type':'WebPage','@id':url+'#trang',url,name:m.title,description:m.description,inLanguage:'vi',isPartOf:{'@type':'WebSite','@id':SITE+'#web'},
     primaryImageOfPage:SITE+m.image,dateModified:m.updated||m.date},
    ...(c?[service(c,url)]:(m.cats||CATS.map(x=>x.id)).map(id=>service(cat(id),url))),
    crumbs([['Trang chủ',SITE],...(m.industry_id?[[hubLink(m.cat_id)[1],SITE+hubLink(m.cat_id)[0]]]:[]),[m.short||m.h1,url]])];
  if(faq.length)graph.push(faqLd(url,faq));
  const related=(m.related||[]).map(s=>POSTS.find(p=>p.slug===s)).filter(Boolean);
  const children=INDUSTRY.filter(p=>!m.industry_id&&m.cat_id&&p.cat_id===m.cat_id);
  const sameInd=m.industry_id?INDUSTRY.filter(p=>p.industry_id===m.industry_id&&p!==m):[];
  const siblings=m.industry_id?INDUSTRY.filter(p=>p.cat_id===m.cat_id&&p!==m):[];
  const from=c?Math.min(...c.tiers.map(t=>t.p)):0,fast=c?c.tiers[0].t:'';
  const act=`<a class="btn primary" href="${ZALO}" target="_blank" rel="noopener">${ICON.zalo} Nhắn Zalo ${esc(PHONE)}</a><a class="btn" href="${up}#lien-he">Gửi yêu cầu tư vấn</a><a class="btn" href="${up}#bao-gia">Xem mẫu đã làm ${ICON.arrow}</a>`;
  const main=`<nav class="bl-wrap bl-crumb" aria-label="Đường dẫn"><a href="${up}">Trang chủ</a><span aria-hidden="true">/</span>${m.industry_id?`<a href="${up}${hubLink(m.cat_id)[0]}">${esc(hubLink(m.cat_id)[1])}</a><span aria-hidden="true">/</span>`:''}<span aria-current="page">${esc(m.short||m.h1)}</span></nav>
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
${children.length?`<section class="bl-wrap bl-more" aria-labelledby="sv-ind-h"><h2 id="sv-ind-h">${esc(c.name)} theo ngành</h2>${links(up,children.map(p=>[p.slug+'/',p.industry,p.short||p.h1]))}</section>\n`:''}${sameInd.length?`<section class="bl-wrap bl-more" aria-labelledby="sv-same-h"><h2 id="sv-same-h">Dịch vụ khác cho ngành ${esc(m.industry.toLowerCase())}</h2>${links(up,sameInd.map(p=>[p.slug+'/',p.short||p.h1,'Giá từ '+fromPrice(p.cat_id)]))}</section>\n`:''}${siblings.length?`<section class="bl-wrap bl-more" aria-labelledby="sv-sib-h"><h2 id="sv-sib-h">${esc(c.name)} cho ngành khác</h2>${links(up,siblings.map(p=>[p.slug+'/',p.industry,p.short||p.h1]))}</section>\n`:''}<section class="bl-wrap bl-more" aria-labelledby="sv-more-h"><h2 id="sv-more-h">${m.industry_id?'Các dịch vụ của Dream Labs':'Dịch vụ khác của Dream Labs'}</h2>
 ${links(up,[...CATS.filter(x=>x.id!==m.cat_id||m.industry_id).map(x=>[hubLink(x.id)[0],hubLink(x.id)[1],'Giá từ '+fromPrice(x.id)]),...HUBS.filter(p=>!p.cat_id&&p!==m).map(p=>[p.slug+'/',p.short||p.h1,'Giá của cả 6 dịch vụ'])])}
</section>
${related.length?`<section class="bl-wrap bl-more sv-posts" aria-labelledby="sv-posts-h"><h2 id="sv-posts-h">Bài viết nên đọc</h2><div class="bl-cards">${related.map(p=>`<article class="bl-card"><a href="${up}blog/${p.slug}/"><span class="bl-card-img"><img src="${up}${p.image}" width="1280" height="791" alt="${esc(p.imageAlt)}" loading="lazy" decoding="async"></span>
 <span class="bl-card-t"><small>${esc(p.cat)}</small><h3>${esc(p.h1)}</h3><span class="bl-card-d">${esc(p.description)}</span></span></a></article>`).join('')}</div></section>`:''}`;
  const dir=path.join(R,m.slug);fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),page({up,cur:hub?hub.slug:m.slug,title:m.title,desc:m.description,canonical:url,image:m.image,imageAlt:m.imageAlt,
    jsonld:ld({'@context':'https://schema.org','@graph':graph}),main,extraHead:m.keywords?`<meta name="keywords" content="${esc(m.keywords.join(', '))}">\n`:''}));
  built.push(`${m.slug} (${words} chữ)`);
}
/* khối "Giải pháp theo ngành" trên trang chủ (src/partials/75-nganh.html): mỗi ngành một thẻ, liên kết tới các dịch vụ của ngành đó */
{
  const order=['spa','nha-khoa','nha-hang','bat-dong-san','my-pham','noi-that','khach-san','giao-duc','thuy-san','ban-hang-online','phong-kham','thoi-trang'];
  const SV={ai:'Tự động hóa AI',web:'Website',landing:'Landing page',video:'Edit video',product:'Bao bì',motion:'Motion graphic'};
  const ids=[...new Set(INDUSTRY.map(p=>p.industry_id))].sort((a,b)=>((order.indexOf(a)+1)||99)-((order.indexOf(b)+1)||99));
  const cards=ids.map(id=>{const ps=INDUSTRY.filter(p=>p.industry_id===id).sort((a,b)=>CATS.findIndex(c=>c.id===a.cat_id)-CATS.findIndex(c=>c.id===b.cat_id));
    return `      <div class="ind"><h3>${esc(ps[0].industry)}</h3><p>${ps.map(p=>`<a href="${p.slug}/">${SV[p.cat_id]}</a>`).join('')}</p></div>`});
  const top=cards.slice(0,8),rest=cards.slice(8);
  fs.writeFileSync(path.join(R,'src/partials/75-nganh.html'),`<!-- Sinh tự động bởi tools/pages.js: đừng sửa tay -->
<section class="band ind-sec" id="theo-nganh" aria-labelledby="ind-h">
  <div class="wrap">
    <div class="bposts-head"><div><p class="eyebrow">Giải pháp theo ngành</p><h2 id="ind-h">Làm đúng cho <em>ngành của bạn.</em></h2></div>
      <a class="btn sm" href="bang-gia/">Bảng giá dịch vụ <svg viewBox="0 0 16 16" aria-hidden="true"><use href="#dl-arrow"/></svg></a></div>
    <p class="ind-lead">Mỗi ngành có cách bán, cách chăm khách và quy định riêng. Chọn ngành của bạn để xem doanh nghiệp được gì từ từng dịch vụ.</p>
    <div class="inds">
${top.join('\n')}
    </div>
${rest.length?`    <details class="ind-more"><summary>Xem thêm ${rest.length} ngành</summary><div class="inds">
${rest.join('\n')}
    </div></details>\n`:''}  </div>
</section>
`);
}
if(require.main===module)console.log('trang dịch vụ:',built.length,'trang ·',built.join(' · '),bad?`\n⚠ ${bad} cảnh báo`:'\n✓ không có cảnh báo');
module.exports={pages:PAGES.map(p=>p.slug)};
