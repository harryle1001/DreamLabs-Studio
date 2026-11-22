/* Dream Labs core — Session A: chrome (theme, menu, con trỏ, chuyển cảnh, nút nổi), hero WebGL, marquee, dịch vụ, quy trình, báo giá + tự tính giá, FAQ, liên hệ, footer.
   API thêm vào DL: DL.go(el|selector) (cuộn có màn chuyển cảnh khi nhảy xa), DL.pick(text) (điền form theo data-pick), DL.isDark(), DL.setTheme('light'|'dark').
   Sự kiện: document 'dl:theme' {detail:{dark}} mỗi khi đổi sáng/tối.
   v3 (Session F): DL.pick(text,note) + thuộc tính data-pick-note="Mẫu tham khảo: Tên (Hạng mục)" ghi thêm một dòng vào ô mô tả; sự kiện 'dl:pick' {detail:{pick,note}} phát ngay trước khi cuộn về form (phòng mẫu nghe để tự đóng);
   DL.copy(text,el) + nút [data-copy] / [data-copy-from="#id"]; chỗ đặt nút "Xem mẫu" .sm-slot[data-sm-slot] dưới mỗi hạng mục giá (js/samples.js điền); form soạn sẵn nội dung để dán qua Zalo. */
(()=>{
const D=window.DL;if(!D)return;
D.ready(()=>{
const g=D.gsap,ST=window.ScrollTrigger,PHI=D.PHI,RM=D.RM,fine=D.fine;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const DATA=window.DL_DATA||{},CATS=DATA.CATS||[],STEPS=DATA.STEPS||[],CMP=DATA.CMP||{};
const vnd=D.vnd,T=D.t||(s=>s),FX=p=>{const f=D.fx?D.fx(p):'';return f?'<small class="fx">'+f+'</small>':''},root=document.documentElement,head=$('#head');
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const safe=(name,fn)=>{try{fn()}catch(e){console.error('[core:'+name+']',e)}};
const ARROW='<svg viewBox="0 0 16 16" aria-hidden="true"><use href="#dl-arrow"/></svg>';
const SP_D='M15 10A1 1 0 0 0 16 9A1 1 0 0 0 15 8A2 2 0 0 0 13 10A3 3 0 0 0 16 13A5 5 0 0 0 21 8A8 8 0 0 0 13 0A13 13 0 0 0 0 13A21 21 0 0 0 21 34A34 34 0 0 0 55 0';
const GRID_D='M13 10h3v3h-3zM16 8h5v5h-5zM13 0h8v8h-8zM0 0h13v13h-13zM0 13h21v21h-21zM21 0h34v34h-34z';
/* icon dịch vụ: tách nét để vẽ dần (.d) + chi tiết chuyển động riêng (.x) */
const P=d=>`<path class="d" pathLength="1" d="${d}"/>`;
const SVC_ICO={
 web:P('M3 6.5h20v13H3z')+P('M3 10h20')+P('M9 21.5h8')+'<path d="M7 8.2h.01M9.5 8.2h.01"/><path class="x cur" d="M14.5 12.5l5.4 2.1-2.3.9-.9 2.3z"/>',
 landing:P('M5 3.5h16v19H5z')+P('M8 7.5h10')+P('M8 11h6')+'<rect class="x cta" x="8" y="14.5" width="10" height="4" rx="2"/>',
 video:'<rect class="d" pathLength="1" x="3" y="6" width="14" height="14" rx="2"/><path class="d x lens" pathLength="1" d="M17 11l6-3.5v11L17 15"/><path class="x play" d="M8.4 10.4v5.2l4.2-2.6z"/>',
 product:P('M13 3l9 5v10l-9 5-9-5V8z')+P('M4 8l9 5 9-5')+P('M13 13v10'),
 motion:'<circle class="x orb" cx="8" cy="13" r="4.5"/><path class="d w1" pathLength="1" d="M14 8.5a6.5 6.5 0 0 1 0 9"/><path class="d w2" pathLength="1" d="M18 6a10 10 0 0 1 0 14"/>',
 ai:'<rect class="d" pathLength="1" x="6" y="6" width="14" height="14" rx="3"/><path class="x core" d="M10 10h6v6h-6z"/><path class="pins" pathLength="1" d="M10 2.5V6M16 2.5V6M10 20v3.5M16 20v3.5M2.5 10H6M2.5 16H6M20 10h3.5M20 16h3.5"/>'
};
const ico=id=>`<svg class="ic-${id}" viewBox="0 0 26 26" aria-hidden="true">${SVC_ICO[id]||(DATA.ICONS||{})[id]||''}</svg>`;
const icoPlain=id=>`<svg viewBox="0 0 26 26" aria-hidden="true">${(DATA.ICONS||{})[id]||''}</svg>`;

/* ═════════ THEME ═════════ */
const mqDark=matchMedia('(prefers-color-scheme: dark)');
const isDark=()=>root.dataset.theme?root.dataset.theme==='dark':mqDark.matches;
const themeSync=()=>{$$('[data-theme-toggle]').forEach(b=>b.setAttribute('aria-pressed',String(isDark())));document.dispatchEvent(new CustomEvent('dl:theme',{detail:{dark:isDark()}}))};
function setTheme(t,ev){
  const apply=()=>{root.dataset.theme=t;try{localStorage.setItem('dl-theme',t)}catch(e){}themeSync()};
  if(RM||!document.startViewTransition){apply();return}
  const r=ev&&ev.currentTarget&&ev.currentTarget.getBoundingClientRect?ev.currentTarget.getBoundingClientRect():null;
  const x=r?r.left+r.width/2:innerWidth*.618,y=r?r.top+r.height/2:innerHeight*.382,R=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
  let vt;try{vt=document.startViewTransition(apply)}catch(e){apply();return}
  vt.ready.then(()=>root.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${R}px at ${x}px ${y}px)`]},{duration:686,easing:'cubic-bezier(.618,0,.382,1)',pseudoElement:'::view-transition-new(root)'})).catch(()=>{});
}
D.isDark=isDark;D.setTheme=t=>setTheme(t);
safe('theme',()=>{
  $$('[data-theme-toggle]').forEach(b=>b.addEventListener('click',e=>setTheme(isDark()?'light':'dark',e)));
  mqDark.addEventListener('change',themeSync);themeSync();
});

/* ═════════ RENDER nội dung từ DL_DATA (trước khi tạo ScrollTrigger) ═════════ */
safe('render-services',()=>{
  const box=$('#svc');if(!box||!CATS.length)return;
  const card=(c,i)=>`<a class="svc" href="#p-${c.id}" data-svc="${c.id}" data-cursor="Xem giá" aria-label="${c.name}: xem bảng giá">
    <div class="svc-media"><img src="img/svc-${c.id}.webp" width="1280" height="791" alt="" loading="lazy" decoding="async">
      <svg class="svc-gold" viewBox="-1 -1 57 36" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path class="g" d="${GRID_D}"/><path class="s" pathLength="1" d="${SP_D}"/></svg>
      <span class="svc-n">0${i+1}</span></div>
    <div class="svc-body"><span class="svc-ico">${ico(c.id)}</span>
      <h3>${c.name}</h3><p>${c.desc}</p>
      <div class="svc-foot"><div class="svc-from">Từ<b><span data-count="${c.tiers[0].p}" data-format="vnd">${vnd(c.tiers[0].p)}</span>${c.tiers[0].u?`<small>${c.tiers[0].u}</small>`:''}</b></div><span class="chip">${c.tag}</span><span class="svc-go">${ARROW}</span></div>
    </div></a>`;
  box.innerHTML=[[0,1,'a'],[2,3,'b'],[4,5,'a']].filter(r=>CATS[r[0]]).map(([i,j,k])=>`<div class="svc-row ${k}" data-stagger>${card(CATS[i],i)}${CATS[j]?card(CATS[j],j):''}</div>`).join('');
  $$('.svc-media img',box).forEach(im=>{const bad=()=>im.classList.add('err');im.addEventListener('error',bad);if(im.complete&&!im.naturalWidth)bad()});
});
safe('render-process',()=>{
  const tr=$('#procTrack');if(!tr)return;
  tr.insertAdjacentHTML('beforeend',STEPS.map((s,i)=>`<article class="step${i%2?' lo':''}"><i class="node"></i><i class="stem"></i>
    <div class="step-card"><span class="n">0${i+1}</span><h3>${s[0]}</h3><p>${s[1]}</p><span class="dur"><span>Thời gian</span><b>${s[2]}</b></span></div></article>`).join('')+
   `<div class="proc-end"><h3>Bắt đầu từ <em>bước 01.</em></h3><a class="btn primary" href="#lien-he" data-magnetic>Đặt lịch khám phá ${ARROW}</a></div>`);
});
safe('render-pricing',()=>{
  const tabs=$('#ptabs'),body=$('#pbody');if(!tabs||!body)return;
  const CLOCK='<svg viewBox="0 0 13 13" aria-hidden="true"><circle cx="6.5" cy="6.5" r="5.2"/><path d="M6.5 3.6v3l2 1.2"/></svg>',LOOP='<svg viewBox="0 0 13 13" aria-hidden="true"><path d="M11 6.5a4.5 4.5 0 1 1-1.4-3.2M11 1.6v2.6H8.4"/></svg>';
  const cell=v=>v===1||v===true?'<i class="y" role="img" aria-label="'+T('Có')+'"></i>':v===0||v===false||v==null?'<i class="no" role="img" aria-label="'+T('Không')+'"></i>':String(v);
  const cmpRows=c=>{
    const rows=[[T('Giá'),...c.tiers.map(t=>`<b>${vnd(t.p)}</b>${t.u||''}${t.plus?' '+T('trở lên'):''}${FX(t.p)}`)],[T('Thời gian'),...c.tiers.map(t=>t.t)],[T('Chỉnh sửa / hỗ trợ'),...c.tiers.map(t=>t.r)]];
    if(CMP[c.id])rows.push(...CMP[c.id]);
    else{const all=[];c.tiers.forEach(t=>t.f.forEach(f=>{const s=typeof f==='string'?f:f.x;if(!all.includes(s))all.push(s)}));all.forEach(s=>rows.push([s,...c.tiers.map(t=>t.f.includes(s)?1:0)]))}
    return rows};
  tabs.insertAdjacentHTML('beforeend',CATS.map((c,i)=>`<button class="ptab${i?'':' on'}" type="button" role="tab" data-t="${c.id}" aria-selected="${!i}">${c.name}</button>`).join(''));
  body.innerHTML=CATS.map(c=>`<div class="pcat" id="p-${c.id}" data-id="${c.id}">
   <div class="pcat-h" data-reveal><h3>${icoPlain(c.id)}${c.name}</h3><p>${c.desc}</p></div>
   <div class="tiers" data-stagger>${c.tiers.map(t=>`<article class="tier${t.hot?' hot':''}" data-tilt>
     ${t.hot?'<span class="badge">'+T('Phổ biến nhất')+'</span>':''}<span class="tn">${t.n}</span>
     <div class="tprice"><span data-count="${t.p}" data-format="vnd">${vnd(t.p)}</span>${t.plus?'<small>'+T('trở lên')+'</small>':''}${t.u?`<small>${t.u}</small>`:''}${FX(t.p)}</div>
     <div class="sub"><span>${CLOCK}${t.t}</span><span>${LOOP}${t.r}</span></div>
     ${t.g?`<p class="tgain"><b>${T('Doanh nghiệp được gì')}</b>${t.g}</p>`:''}<ul>${t.f.map(f=>typeof f==='string'?`<li>${f}</li>`:`<li class="no">${f.x}</li>`).join('')}</ul>
     <a class="btn${t.hot?' primary':''}" href="#lien-he" data-pick="${c.name} — ${t.n}">${T('Chọn gói này')}</a></article>`).join('')}</div>
   <div class="tier-dots" aria-hidden="true">${c.tiers.map(()=>'<i></i>').join('')}</div>
   <div class="sm-slot" data-sm-slot="${c.id}"></div>
   <div class="cmp"><button class="cmp-btn" type="button" aria-expanded="false" aria-controls="cmp-${c.id}"><span>${T('So sánh chi tiết {n} gói {c}',{n:c.tiers.length,c:c.name})}</span><i aria-hidden="true"></i></button>
    <div class="cmp-body" id="cmp-${c.id}" hidden><div class="cmp-scroll"><table><thead><tr><th scope="col">${T('Hạng mục')}</th>${c.tiers.map(t=>`<th scope="col"${t.hot?' class="hot"':''}>${t.n}</th>`).join('')}</tr></thead>
    <tbody>${cmpRows(c).map(r=>`<tr><th scope="row">${r[0]}</th>${c.tiers.map((t,i)=>`<td${t.hot?' class="hot"':''}>${cell(r[i+1])}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div></div>
  </div>`).join('');
  const el=$('#estList');
  if(el)el.innerHTML=CATS.map(c=>`<div class="est-row" data-c="${c.id}"><div class="l" id="el-${c.id}">${icoPlain(c.id)}<span>${c.name}<small>${c.tag}</small></span></div>
   <div class="seg" role="group" aria-labelledby="el-${c.id}" data-c="${c.id}"><button type="button" class="on" data-i="-1" aria-pressed="true">${T('Không')}</button>${c.tiers.map((t,i)=>`<button type="button" data-i="${i}" aria-pressed="false">${t.n}</button>`).join('')}</div></div>`).join('');
});
safe('render-form',()=>{
  const sel=$('#f-svc');
  if(sel)sel.innerHTML='<option value="">'+T('Chưa chắc, cần tư vấn')+'</option>'+CATS.map(c=>`<optgroup label="${c.name}">${c.tiers.map(t=>`<option>${c.name} — ${t.n}</option>`).join('')}</optgroup>`).join('')+'<option value="combo">'+T('Cấu hình tự tính')+'</option>';
});
D.scan(document);

/* ═════════ CUỘN + CHUYỂN CẢNH ═════════ */
const veil=$('#veil');let veilBusy=false;
function go(target,o={}){
  const el=typeof target==='string'?$(target):target;if(!el)return;
  const tabsBar=$('.ptabs'),extra=o.extra!=null?o.extra:(el.classList.contains('pcat')&&tabsBar?tabsBar.offsetHeight:0);
  const far=Math.abs(el.getBoundingClientRect().top)>innerHeight*PHI*PHI;
  if(RM||!g||!veil||!far){D.scrollTo(el,{extra});return}
  if(veilBusy)return;veilBusy=true;
  g.timeline({onComplete:()=>{veilBusy=false}})
   .set(veil,{visibility:'visible',clipPath:'inset(100% 0% 0% 0%)'})
   .fromTo(veil.firstElementChild,{rotate:-137.5,scale:.618},{rotate:0,scale:1,duration:1.11,ease:'power3.out'},0)
   .to(veil,{clipPath:'inset(0% 0% 0% 0%)',duration:.424,ease:'power3.inOut'},0)
   .add(()=>{D.scrollTo(el,{extra,immediate:true});ST&&ST.update()})
   .to(veil,{clipPath:'inset(0% 0% 100% 0%)',duration:.686,ease:'power3.inOut'},'+=.1')
   .set(veil,{visibility:'hidden'});
}
D.go=go;

/* ═════════ data-pick → form liên hệ ═════════ */
const norm=s=>String(s||'').normalize('NFC').toLowerCase().replace(/[‐-―\-·:|/,]+/g,' ').replace(/\s+/g,' ').trim();
const priceOf=name=>{for(const c of CATS)for(const t of c.tiers)if(norm(c.name+' '+t.n)===norm(name))return D.vndx(t.p)+(t.u||'')+(t.plus?' '+T('trở lên'):'');return ''};
function pickBanner(text,flash){
  const b=$('#cfPick');if(!b)return;
  if(!text){b.hidden=true;return}
  const pr=priceOf(text);$('#cfPickName').textContent=text+(pr?' · '+pr:'');b.hidden=false;
  if(flash){b.classList.remove('flash');void b.offsetWidth;b.classList.add('flash')}
}
function hit(el){const f=el&&el.closest('.field');if(!f)return;f.classList.remove('hit');void f.offsetWidth;f.classList.add('hit')}
/* ghi chú đi kèm data-pick (data-pick-note="Mẫu tham khảo: Tên mẫu (Hạng mục)"): thêm vào ô mô tả, thay dòng cũ cùng hạng mục */
function pickNote(raw){
  const msg=$('#f-msg'),n=String(raw||'').replace(/\s+/g,' ').trim();if(!msg||!n)return;
  const key=(n.match(/\([^()]*\)$/)||[''])[0],head=n.split(':')[0]+':';
  const lines=msg.value.split('\n').filter(l=>{const x=l.trim();return x&&x!==n&&!(key&&x.startsWith(head)&&x.endsWith(key))});
  lines.push(n);msg.value=lines.join('\n');hit(msg);
}
function pick(raw,note){
  const sel=$('#f-svc'),msg=$('#f-msg'),t=String(raw||'').trim();if(note)pickNote(note);if(!sel||!t)return false;
  const done=$('#cfDone');if(done)done.hidden=true;
  const opt=[...sel.options].find(o=>o.value&&norm(o.value)===norm(t));
  if(opt){sel.value=opt.value;pickBanner(opt.value,true);hit(sel);return true}
  const line=T('Quan tâm:')+' '+t;
  if(msg&&!msg.value.includes(line)){msg.value=(msg.value.trim()?msg.value.trim()+'\n':'')+line;hit(msg)}
  pickBanner(t,true);return false;
}
D.pick=pick;

/* ?chon=<gói>&ghi-chu=… (từ /lab/) hoặc ?cau-hinh=… (công cụ tự tính giá ở /bang-gia/): điền sẵn form liên hệ rồi xóa tham số khỏi địa chỉ */
safe('url-pick',()=>{
  const q=new URLSearchParams(location.search),c=q.get('chon'),n=q.get('ghi-chu'),h=q.get('cau-hinh');if(!c&&!h)return;
  if(c)pick(c,n||'');
  if(h){const sel=$('#f-svc'),msg=$('#f-msg');if(sel)sel.value='combo';if(msg)msg.value=T('Cấu hình:')+' '+h;pickBanner(T('Cấu hình tự tính'),true)}
  try{history.replaceState(null,'',location.pathname+location.hash)}catch(e){}
  const f=$('#lien-he');if(f)setTimeout(()=>D.scrollTo(f,{immediate:true}),60);
});

/* ═════════ MENU ĐIỆN THOẠI ═════════ */
const menu=$('#menu'),burger=$('#burger');
function setMenu(open){
  if(!menu||!burger||menu.classList.contains('open')===open)return;
  if(open){const r=burger.getBoundingClientRect();menu.style.setProperty('--cx',(r.left+r.width/2)+'px');menu.style.setProperty('--cy',(r.top+r.height/2)+'px')}
  menu.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);
  menu.inert=!open;menu.setAttribute('aria-hidden',String(!open));
  burger.setAttribute('aria-expanded',String(open));burger.setAttribute('aria-label',open?T('Đóng menu'):T('Mở menu'));
  if(D.lenis)open?D.lenis.stop():D.lenis.start();
}
safe('menu',()=>{
  if(!menu||!burger)return;menu.inert=true;
  burger.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click',e=>{if(e.target.closest('a,[data-sm-open]'))setMenu(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false);setFab(false)}});
  matchMedia('(min-width:861px)').addEventListener('change',e=>{if(e.matches)setMenu(false)});
});

/* menu "Dịch vụ" ở đầu trang: rê chuột hoặc bấm để mở, Esc / bấm ra ngoài để đóng */
safe('navdd',()=>{
  const dd=$('.nav-dd'),b=dd&&$('.nav-dd-b',dd);if(!b)return;
  const set=o=>{dd.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o))};
  b.addEventListener('click',()=>set(!dd.classList.contains('open')));
  dd.addEventListener('mouseenter',()=>b.setAttribute('aria-expanded','true'));
  dd.addEventListener('mouseleave',()=>{if(!dd.classList.contains('open'))b.setAttribute('aria-expanded','false')});
  document.addEventListener('click',e=>{if(!dd.contains(e.target))set(false)});
  dd.addEventListener('keydown',e=>{if(e.key==='Escape'){set(false);b.focus()}});
  dd.addEventListener('focusout',e=>{if(!dd.contains(e.relatedTarget))set(false)});
});

/* ═════════ SAO CHÉP: nút [data-copy="chuỗi"] hoặc [data-copy-from="#id"]; không chép được thì bôi chọn sẵn để khách tự chép ═════════ */
async function copyText(t,srcEl){
  try{await navigator.clipboard.writeText(t);return true}catch(e){}
  try{const ta=document.createElement('textarea');ta.value=t;ta.readOnly=true;ta.style.cssText='position:fixed;left:0;top:0;opacity:0';
    (srcEl&&srcEl.closest('dialog')||document.body).append(ta);ta.select();const ok=document.execCommand('copy');ta.remove();if(ok)return true}catch(e){}
  try{if(srcEl){const r=document.createRange();r.selectNodeContents(srcEl);const s=getSelection();s.removeAllRanges();s.addRange(r)}}catch(e){}
  return false;
}
D.copy=copyText;
document.addEventListener('click',async e=>{
  const b=e.target.closest&&e.target.closest('button[data-copy],button[data-copy-from]');if(!b||b.dataset.busy)return;
  const src=b.dataset.copyFrom?$(b.dataset.copyFrom):b.previousElementSibling,t=b.dataset.copyFrom?(src?src.textContent:''):b.dataset.copy;if(!t)return;
  const label=b.textContent;b.dataset.busy='1';const ok=await copyText(t,src);
  b.textContent=ok?T('Đã chép'):T('Đã bôi chọn');setTimeout(()=>{b.textContent=label;delete b.dataset.busy},1618);
});

/* ═════════ NÚT NỔI ═════════ */
const fab=$('#fab'),fabBtn=$('#fabBtn'),fabCard=$('#fabCard');
function setFab(open){if(!fab||fab.classList.contains('open')===open)return;fab.classList.toggle('open',open);fabBtn.setAttribute('aria-expanded',String(open));fabCard.inert=!open}
safe('fab',()=>{
  if(!fab)return;fabCard.hidden=false;fabCard.inert=true;
  fabBtn.addEventListener('click',()=>setFab(!fab.classList.contains('open')));
  document.addEventListener('pointerdown',e=>{if(fab.classList.contains('open')&&!fab.contains(e.target))setFab(false)});
  if(ST){let past=false,atEnd=false;const upd=()=>{fab.classList.toggle('show',past&&!atEnd);if(!past||atEnd)setFab(false)};
    const a=s=>{past=s.progress>0;upd()},b=s=>{atEnd=s.progress>0;upd()};
    ST.create({start:()=>innerHeight*.618,end:'max',onToggle:a,onUpdate:a,onRefresh:a});
    const c=$('#lien-he');if(c)ST.create({trigger:c,start:'top 61.8%',end:'max',onToggle:b,onUpdate:b,onRefresh:b});
  }else fab.classList.add('show');
  /* điện thoại: cuộn xuống thì tạm ẩn để không che mẫu, cuộn lên hoặc dừng thì hiện lại */
  let ly=scrollY,tm=0;addEventListener('scroll',()=>{const y=scrollY,dn=y>ly+4,up=y<ly-4;if(dn||up){fab.classList.toggle('away',dn);ly=y}
    clearTimeout(tm);tm=setTimeout(()=>fab.classList.remove('away'),900)},{passive:true});
});

/* ═════════ CLICK TOÀN TRANG: data-pick + anchor (capture, chạy trước kit) ═════════ */
document.addEventListener('click',e=>{
  if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||!e.target.closest)return;
  if(D.samples&&e.target.closest('[data-sm-open]'))return; // phòng mẫu (samples.js) tự xử lý
  const p=e.target.closest('[data-pick]');
  if(p&&!$('#cf')){e.preventDefault();location.href=new URL('./?chon='+encodeURIComponent(p.dataset.pick)+(p.dataset.pickNote?'&ghi-chu='+encodeURIComponent(p.dataset.pickNote):'')+'#lien-he',document.baseURI).href;return}
  if(p){e.preventDefault();pick(p.dataset.pick,p.dataset.pickNote);document.dispatchEvent(new CustomEvent('dl:pick',{detail:{pick:p.dataset.pick,note:p.dataset.pickNote||''}}));D.modal.close();setMenu(false);setFab(false);D.lenis&&D.lenis.start();go('#lien-he');return}
  const a=e.target.closest('a[href^="#"]');if(!a)return;
  const id=a.getAttribute('href').slice(1),el=id&&document.getElementById(id);if(!el)return;
  e.preventDefault();
  if(a.id==='estGo'){const sel=$('#f-svc'),msg=$('#f-msg'),s=a.dataset.summary;if(sel){sel.value='combo';hit(sel)}if(s&&msg)msg.value=T('Cấu hình:')+' '+s;pickBanner(s?T('Cấu hình tự tính'):'',true);const dn=$('#cfDone');if(dn)dn.hidden=true}
  D.modal.close();setMenu(false);setFab(false);D.lenis&&D.lenis.start(); /* dialog vừa đóng: mở lại Lenis ngay, nếu chờ sự kiện close thì cuộn mượt bị hủy */
  go(el);
},true);

/* ═════════ HEADER: nền kính, thanh tiến trình, scrollspy ═════════ */
safe('header',()=>{
  if(!head)return;const bar=$('#headProg');
  const onS=()=>head.classList.toggle('solid',scrollY>26);addEventListener('scroll',onS,{passive:true});onS();
  if(!ST)return;
  ST.create({start:0,end:'max',onUpdate:s=>{if(bar)bar.style.transform=`scaleX(${s.progress.toFixed(4)})`}});
  $$('.nav a[href^="#"]').forEach(a=>{const el=$(a.getAttribute('href'));if(el)ST.create({trigger:el,start:'top 50%',end:'bottom 50%',onToggle:s=>a.classList.toggle('on',s.isActive)})});
});

/* ═════════ CON TRỎ ═════════ */
safe('cursor',()=>{
  const cur=$('#cur');if(!cur||!fine||RM||!g)return;
  const label=$('.cur-label',cur);
  const top=()=>{try{if(cur.matches(':popover-open'))cur.hidePopover();cur.showPopover()}catch(e){}};
  if(cur.showPopover){cur.setAttribute('popover','manual');top();
    new MutationObserver(ms=>{if(ms.some(m=>m.target.nodeName==='DIALOG'&&m.target.open))top()}).observe(document.body,{attributes:true,attributeFilter:['open'],subtree:true})}
  const qx=g.quickTo(cur,'x',{duration:.262,ease:'power3'}),qy=g.quickTo(cur,'y',{duration:.262,ease:'power3'});let first=true;
  addEventListener('pointermove',e=>{if(e.pointerType&&e.pointerType!=='mouse')return;
    if(first){g.set(cur,{x:e.clientX,y:e.clientY});first=false}
    cur.classList.add('on');qx(e.clientX);qy(e.clientY);
    const t=e.target.closest?e.target:null,lb=t&&t.closest('[data-cursor]'),tx=lb&&T(lb.dataset.cursor);
    if(tx&&label.textContent!==tx)label.textContent=tx;
    cur.classList.toggle('is-label',!!tx);
    cur.classList.toggle('is-text',!tx&&!!(t&&t.closest('input,textarea,select,[contenteditable]')));
    cur.classList.toggle('is-link',!tx&&!!(t&&t.closest('a,button,summary,label,[role="tab"],[role="button"],[data-tilt]')));
  },{passive:true});
  addEventListener('pointerdown',()=>cur.classList.add('is-down'),{passive:true});
  addEventListener('pointerup',()=>cur.classList.remove('is-down'),{passive:true});
  document.addEventListener('pointerleave',()=>cur.classList.remove('on'));
  root.addEventListener('mouseleave',()=>cur.classList.remove('on'));
});

/* ═════════ HERO: aurora + hạt phyllotaxis (WebGL thuần, 1 context, aurora vẽ vào FBO độ phân giải thấp) ═════════ */
let heroIntro=()=>{};
safe('hero',()=>{
  const sec=$('.hero'),cv=$('#sky');if(!sec||!cv)return;
  const small=innerWidth<760,N=small?610:1597,DN=small?200:420,TR=36,nEl=$('#heroN');
  if(nEl)nEl.textContent=N.toLocaleString('vi-VN')+' hạt';
  /* Dự phòng khi WebGL không khởi tạo được hoặc bị mất (context lost): Canvas2D vẽ cùng hình xoắn ốc, xoay theo thời gian.
     Chạy rAF riêng, dừng khi hero khuất / tab ẩn; giảm chuyển động: xoay chậm hơn. Không ghi lỗi ra console. */
  const art2d=$('#heroArt');let fb2=null,logged=false;
  const diag=mode=>{if(logged)return;logged=true;console.info('[hero] mode='+mode+' rm='+RM)}; // chẩn đoán máy khách, không phải lỗi
  /* Cảnh mở đầu (~7,1 giây): 0–2,5s hai sao đôi bay vào, quay quanh nhau nhanh dần → va chạm, chớp sáng;
     2,5–7,1s sao bung ra rồi bị hút xoáy về hình xoắn ốc → xoay liên tục.
     Chỉ bắt đầu khi trang thật sự hiển thị: đã load + font sẵn sàng + màn che #pre xong + tab đang hiển thị.
     Xem lại: thêm ?intro vào URL (bỏ chờ màn che), hoặc bấm đúp vào nền hero trên máy tính. Chạy cả khi giảm chuyển động. */
  const INTRO_BIN=3.4,INTRO_BANG=4.6,replayQ=new URLSearchParams(location.search).has('intro');
  const preDone=()=>{const pre=$('#pre');if(!pre||replayQ)return Promise.resolve();let an=[];try{an=pre.getAnimations({subtree:true})}catch(e){}
    return Promise.race([Promise.all(an.map(a=>a.finished.catch(()=>0))),new Promise(r=>setTimeout(r,2500))])};
  const loaded=()=>document.readyState==='complete'?Promise.resolve():Promise.race([new Promise(r=>addEventListener('load',r,{once:true})),new Promise(r=>setTimeout(r,6000))]);
  const shown=()=>document.visibilityState==='visible'?Promise.resolve():new Promise(r=>{const f=()=>{if(document.visibilityState==='visible'){document.removeEventListener('visibilitychange',f);r()}};document.addEventListener('visibilitychange',f)});
  const introReady=Promise.all([loaded(),document.fonts?document.fonts.ready.catch(()=>0):0,preDone()]).then(shown).then(()=>new Promise(r=>requestAnimationFrame(()=>r())));
  /* Hai sao khổng lồ (dùng chung WebGL / Canvas2D). it: giây kể từ khi cảnh bắt đầu; w,h: kích thước canvas (px thiết bị);
     cx,cy: tâm xoắn ốc (px, y hướng lên). Bay vào từ mép trái & phải, tăng tốc, xoay quanh nhau ~1,2 vòng rồi đâm vào nhau ở tâm.
     Va chạm: chớp sáng ~150ms, sóng xung kích vành khuyên, rung khung 300ms, lõi sáng tàn dần. */
  /* quỹ đạo: xoắn ốc log thu dần (bán kính giảm theo bội số cố định mỗi 1/4 vòng), chậm lúc đầu rồi nhanh dần (mũ 2,618) */
  const starPos=(it,w,h,cx,cy)=>{const q=Math.min(1,Math.max(0,it/INTRO_BIN)),sq=.146*q+.854*Math.pow(q,2.618),TH=Math.PI*2.6,th=Math.PI-.22+TH*sq,e=Math.min(1,Math.max(0,(q-.8)/.2)),
    r0=small?Math.max(w,h)*.55:w*.6,r=r0*Math.pow(1.61803399,-TH*sq/(Math.PI/2))*(1-e*e*(3-2*e));return[cx+Math.cos(th)*r,cy+Math.sin(th)*r,cx-Math.cos(th)*r,cy-Math.sin(th)*r,q]};
  const starState=(it,w,h,cx,cy)=>{const o={sa:0,ma:0,fl:0,shr:0,sha:0,shake:0,tc:-1,rs:(small?w*.13:h*.085),x1:0,y1:0,x2:0,y2:0,bx1:0,by1:0,bx2:0,by2:0};if(it==null)return o;
    const a=starPos(it,w,h,cx,cy),b=starPos(Math.max(0,it-.3),w,h,cx,cy),q=a[4];o.x1=a[0];o.y1=a[1];o.x2=a[2];o.y2=a[3];o.bx1=b[0];o.by1=b[1];o.bx2=b[2];o.by2=b[3];o.rs*=.85+.35*q;
    if(it<INTRO_BIN){o.sa=Math.min(1,q/.1);o.fl=.3*Math.pow(Math.max(0,(q-.84)/.16),2)}
    else{const tc=it-INTRO_BIN;o.tc=tc;o.fl=tc<1.6?1.05*Math.exp(-tc/.17):0;o.ma=tc<5?Math.exp(-tc/.95):0;o.shr=tc*Math.max(w,h)*1.15;o.sha=tc<1.3?Math.pow(1-tc/1.3,1.3):0;o.shake=!RM&&tc<.45?(1-tc/.45)*7:0}
    return o};
  /* rung khung: chỉ transform lớp nền hero, 300ms sau va chạm */
  const bgEl=$('.hero-bg');let shook=false;const shake=v=>{if(!bgEl)return;if(v>0){shook=true;bgEl.style.transform=`translate3d(${((Math.random()-.5)*2*v).toFixed(1)}px,${((Math.random()-.5)*2*v).toFixed(1)}px,0)`}else if(shook){shook=false;bgEl.style.transform=''}};
  const introHooks=[];let introFired=false;const replay=()=>{introFired=true;introHooks.forEach(f=>f())};D.heroReplay=replay;
  introReady.then(replay);
  if(fine)sec.addEventListener('dblclick',e=>{if(e.target.closest('a,button,input,select,textarea,h1,p,.hero-cta'))return;replay()});
  const fallback=()=>{sec.classList.add('no-gl');sec.classList.remove('gl-on');const fb=$('#heroFb');if(!fb)return;
    if(fb2){fb2.start();return}
    const c=document.createElement('canvas');c.setAttribute('aria-hidden','true');fb.appendChild(c);const x=c.getContext('2d');if(!x)return;
    const n=small?520:900,PH=1.61803399,P=[];const hh=v=>{const q=Math.sin(v*12.9898+4.1414)*43758.5453;return q-Math.floor(q)};
    for(let i=0;i<n;i++){const k=(i+.5)/n,h1=hh(i),h2=hh(i*1.7+3),h3=hh(i*2.3+7),rs=.012+.988*k;
      const dist=.3+1.75*Math.pow(h2,.75);P.push({b:Math.log(rs)/Math.log(PH)*Math.PI/2+.227,r:rs*(1+(h1+h2-1)*.09),jx:(h2-.5)*.012,jy:(h3-.5)*.012,sz:(1.6+3.6*Math.sqrt(k))*(.8+.4*h1),a:.35+.5*(1-k*.6),m:Math.min(1,Math.max(0,1-Math.sqrt(rs)+(h2-.5)*.2)),tw:h1*6.283,ea:h1*6.2832,ed:dist,dn:(dist-.3)/1.75})}
    const DU=[];for(let i=0;i<(small?120:240);i++)DU.push([hh(i+5e3),hh(i*1.3+7e3),.6+1.4*hh(i*2.1+9e3),hh(i*3.7+1e4)*6.283]);
    let W=0,H=0,cx=0,cy=0,R=0,rot=0,spd=0,last=0,t=0,b2=0,bi2=0,at2=null,raf=0,vis=true,run=false,cols=['#5E43A8','#8C7BC8','#C08A9A'];
    const dpr2=Math.min(devicePixelRatio||1,1.5);
    const fit=()=>{const w=sec.offsetWidth,h=sec.offsetHeight;W=c.width=Math.round(w*dpr2);H=c.height=Math.round(h*dpr2);
      let ex=w*.67,ey=h*.5,r=Math.min(w,h)*.3;if(art2d){let e=art2d,ox=art2d.offsetWidth/2,oy=art2d.offsetHeight/2;while(e&&e!==sec){ox+=e.offsetLeft;oy+=e.offsetTop;e=e.offsetParent}
        if(e===sec){ex=ox;ey=oy;r=Math.min(art2d.offsetWidth,art2d.offsetHeight)/2*.96}}
      cx=ex*dpr2;cy=ey*dpr2;R=r*dpr2*(small?1.05:1.2);const cs=getComputedStyle(root);cols=['--accent','--lav','--peach'].map(k=>cs.getPropertyValue(k).trim()||'#5E43A8')};
    const eo=v=>{v=Math.min(1,Math.max(0,v));return 1-(1-v)**3},eio=v=>{v=Math.min(1,Math.max(0,v));return v<.5?4*v*v*v:1-(-2*v+2)**3/2};
    const paint=()=>{x.clearRect(0,0,W,H);const tilt=Math.cos(.3);
      /* bụi sao xa */
      x.fillStyle=cols[1];for(const [u,v,z,ph] of DU){x.globalAlpha=(.12+.2*(.5+.5*Math.sin(t*.8+ph)))*Math.min(1,b2*4+bi2*2+.15);x.fillRect(u*W,v*H,z*dpr2,z*dpr2)}x.globalAlpha=1;
      /* hai sao khổng lồ + va chạm (bản đơn giản của WebGL): quầng nhiều lớp, chớp sáng, sóng xung kích, rung khung */
      {const S=starState(at2==null?null:t-at2,W,H,cx,H-cy);shake(S.shake);
        const big=(X,Y,rr,c1,a)=>{if(a<=0)return;const g1=x.createRadialGradient(X,Y,0,X,Y,rr*4.5);g1.addColorStop(0,`rgba(255,250,240,${a})`);g1.addColorStop(.2,`rgba(255,250,240,${a})`);g1.addColorStop(.32,`rgba(${c1},${.8*a})`);g1.addColorStop(1,`rgba(${c1},0)`);x.fillStyle=g1;x.beginPath();x.arc(X,Y,rr*4.5,0,6.2832);x.fill()};
        big(S.x1,H-S.y1,S.rs,'128,117,255',S.sa);big(S.x2,H-S.y2,S.rs,'255,153,128',S.sa);big(cx,cy,S.rs*1.5,'255,209,148',S.ma);
        if(S.sha>.002){x.strokeStyle=`rgba(255,242,214,${.9*S.sha})`;x.lineWidth=Math.max(W,H)*.02;x.beginPath();x.arc(cx,cy,S.shr,0,6.2832);x.stroke()}
        if(S.fl>.002){x.fillStyle=`rgba(255,247,230,${Math.min(1,S.fl*(RM?.5:1))})`;x.fillRect(0,0,W,H)}}
      if(at2!=null&&b2>0)for(let j=0;j<3;j++){x.fillStyle=cols[j];x.beginPath();
        for(let i=j;i<n;i+=3){const q=P[i],th=q.b+rot+Math.sin(t*.2)*.06,br=RM?1:1+.04*Math.sin(t*1.3-q.r*7);let ux=Math.cos(th)*q.r*br+q.jx,uy=Math.sin(th)*q.r*br+q.jy;
          if(b2<1){const b1=eo(b2/.16),ex=Math.cos(q.ea)*1.45*q.ed*b1,ey=Math.sin(q.ea)*q.ed*b1,sv=eio((b2-.3-.2*q.dn)/.48),rE=Math.hypot(ex,ey),aE=Math.atan2(ey,ex),rF=Math.hypot(ux,uy),aF=Math.atan2(uy,ux),
            dA=((aF-aE)%6.2832+6.2832)%6.2832+3.1416,a=aE+dA*sv,r=rE+(rF-rE)*sv;ux=Math.cos(a)*r;uy=Math.sin(a)*r}
          const px=cx+ux*R,py=cy-uy*R*tilt,s=q.sz*dpr2*.5;
          x.moveTo(px+s,py);x.arc(px,py,s,0,6.2832)}
        x.globalAlpha=j?.55:.8;x.fill()}x.globalAlpha=1};
    const loop=now=>{raf=0;if(!run)return;const dt=Math.min(.05,(now-last)/1000||.016);last=now;t+=dt;if(at2!=null){const it=t-at2;bi2=Math.min(1,Math.max(0,it/INTRO_BIN));b2=Math.min(1,Math.max(0,(it-INTRO_BIN)/INTRO_BANG))}spd+=((RM?.157:.25)-spd)*Math.min(1,dt*.4);rot+=dt*spd;paint();raf=requestAnimationFrame(loop)};
    const set=()=>{const on=vis&&!document.hidden&&sec.classList.contains('no-gl');if(on===run)return;run=on;if(on&&!raf){last=performance.now();raf=requestAnimationFrame(loop)}};
    new IntersectionObserver(([en])=>{vis=en.isIntersecting;set()}).observe(sec);document.addEventListener('visibilitychange',set);
    new ResizeObserver(()=>{fit();paint()}).observe(sec);document.addEventListener('dl:theme',()=>{fit();paint()});
    D.heroState=()=>({rot:+rot.toFixed(3),bin:+bi2.toFixed(3),bang:+b2.toFixed(3),mode:'2d'});diag('canvas2d');introHooks.push(()=>{at2=t;bi2=0;b2=0});if(introFired){at2=t-INTRO_BIN-INTRO_BANG;bi2=b2=1}fit();paint();set();fb2={start:()=>{c.hidden=false;set()},stop:()=>{c.hidden=true;run=false}}};
  let gl=null;try{gl=cv.getContext('webgl',{antialias:false,alpha:false,depth:false,stencil:false,powerPreference:'high-performance'})}catch(e){}
  if(!gl){fallback();return}
  const HP='#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';
  const VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS_A=HP+`uniform vec2 r,m,ctr;uniform float t,sc;uniform vec3 c0,c1,c2,c3;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.+vec2(1.7,9.2);a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r;float asp=r.x/r.y;vec2 p=uv*vec2(asp,1.)*1.618;float s=t*.045;p.y+=sc*.618;
 vec2 q=vec2(fbm(p+s),fbm(p+vec2(5.2,1.3)-s));
 vec2 w=vec2(fbm(p+1.618*q+vec2(1.7,9.2)+s*1.5+m*.382),fbm(p+1.618*q+vec2(8.3,2.8)-s));
 float f=fbm(p+2.*w);
 vec3 col=mix(c0,c1,smoothstep(.25,.85,f));
 col=mix(col,c2,smoothstep(.35,.95,length(q))*.7);
 col=mix(col,c3,smoothstep(.55,1.,w.x)*.7);
 float band=pow(sin(p.x*1.618+w.y*4.+s*2.)*.5+.5,3.)*smoothstep(.1,.9,uv.y);
 col=mix(col,mix(c1,c3,.382),band*.382);
 vec2 d=(uv-ctr)*vec2(asp,1.);col=mix(col,c0,exp(-dot(d,d)*3.)*.382);
 col=mix(col,c0,smoothstep(.55,1.,uv.y)*.35);
 gl_FragColor=vec4(col,1.);}`;
  const FS_B0=HP+`uniform sampler2D tx;uniform vec2 r;void main(){vec3 c=texture2D(tx,gl_FragCoord.xy/r).rgb;
 float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);gl_FragColor=vec4(c+(g-.5)/96.,1.);}`;
  /* Lớp hiệu ứng mở đầu: hai ngôi sao (bề mặt sôi, viền tối dần, vành nhật hoa, tia nhiễu xạ, đuôi sáng, cầu vật chất khi áp sát)
     → va chạm: chớp sáng, quả cầu lửa, tia sáng tỏa, hai vành sóng xung kích. Chỉ chạy trong cảnh mở đầu. */
  const FS_B=HP+`uniform sampler2D tx;uniform vec2 r,ctr,s1,s2,s1b,s2b;uniform float fl,sr,sa,ma,shr,sha,tm,tc;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
vec4 star(vec2 p,vec2 c,float R,vec3 hot,vec3 cool,float ph){vec2 v=(p-c)/R;float d=length(v);if(d>10.)return vec4(0.);
 float ang=atan(v.y,v.x);vec2 dir=v/max(d,1e-4);float o=max(d-1.,0.);
 float halo=exp(-d*.6)*.62+.1/(d*d+.35);
 float cn=fbm(dir*2.6+vec2(d*1.1-tm*.55,ph)),cor=exp(-o*2.1)*(.35+1.1*cn);
 float st=pow(.5+.5*sin(ang*6.+sin(ang*2.+ph)*2.5+ph+tm*.4),5.)*exp(-o*.75)*.55;
 vec2 q=vec2(v.x+v.y,v.x-v.y)*.7071;
 float sp=(exp(-abs(q.y)*16.)*exp(-abs(q.x)*.26)+exp(-abs(q.x)*16.)*exp(-abs(q.y)*.26))*.6+exp(-abs(v.y)*26.)*exp(-abs(v.x)*.13)*.5;
 float g=clamp(halo+cor+st+sp,0.,1.);
 vec3 gc=mix(cool,mix(hot,vec3(1.),.45),clamp(cor*.8+sp+exp(-d*1.1),0.,1.));
 float disk=smoothstep(1.03,.95,d);
 if(disk>0.){float cs=cos(tm*.35+ph),sn=sin(tm*.35+ph);vec2 u=mat2(cs,-sn,sn,cs)*v;float z=sqrt(max(1.-d*d,0.));u/=(.6+.4*z);
  float gr=fbm(u*3.2+ph*7.),cell=fbm(u*7.+vec2(tm*.25,-tm*.2)+gr*1.5);
  vec3 sf=mix(cool,hot,.35+.65*z);sf=mix(sf,vec3(1.,.99,.95),z*z*.75);sf*=.8+.4*gr;sf+=hot*pow(cell,3.)*.9;
  float spot=smoothstep(.62,.7,fbm(u*1.6+ph*3.+5.))*.35;sf=mix(sf,cool*.55,spot*z);
  sf=mix(sf,vec3(1.),.3*pow(1.-z,3.));gc=mix(gc,sf,disk);g=max(g,disk);}
 return vec4(gc,g);}
float tail(vec2 p,vec2 a,vec2 b,float R){vec2 ab=b-a;float k=clamp(dot(p-a,ab)/max(dot(ab,ab),1.),0.,1.),ds=length(p-a-ab*k)/R,w=mix(.85,.12,k);return exp(-ds*ds/(w*w))*(1.-k)*.6;}
void main(){vec2 p=gl_FragCoord.xy;vec3 c=texture2D(tx,p/r).rgb;float mxr=max(r.x,r.y);
 if(sa>0.){vec3 hA=vec3(.78,.84,1.),cA=vec3(.36,.3,1.),hB=vec3(1.,.86,.6),cB=vec3(1.,.4,.38);
  c=mix(c,cA,tail(p,s1,s1b,sr)*sa);c=mix(c,cB,tail(p,s2,s2b,sr)*sa);
  float br=smoothstep(9.,2.5,length(s1-s2)/sr)*sa;
  if(br>.01){vec2 ab=s2-s1;float k=clamp(dot(p-s1,ab)/max(dot(ab,ab),1.),0.,1.),ds=length(p-s1-ab*k)/sr,wv=.5+.5*sin(k*40.-tm*14.);
   c=mix(c,mix(vec3(.62,.5,1.),vec3(1.,.9,.8),wv),exp(-ds*ds*9.)*br*(.55+.45*wv));}
  vec4 a=star(p,s1,sr,hA,cA,0.),b=star(p,s2,sr,hB,cB,2.);c=mix(c,a.rgb,a.a*sa);c=mix(c,b.rgb,b.a*sa);}
 vec2 v=p-ctr;float dl=length(v),dn=dl/mxr;
 if(tc>=0.){float ang=atan(v.y,v.x),e1=exp(-tc/.55);
  if(e1>.004){float ry=pow(.5+.5*sin(ang*17.+sin(ang*3.)*3.+sin(ang*5.+1.)*2.),5.)+.6*pow(.5+.5*sin(ang*41.+sin(ang*7.)*2.),9.);
   c=mix(c,vec3(1.,.92,.74),clamp(ry*e1*exp(-dn*2.4)*1.5,0.,1.));}
  if(ma>.004){float fr=sr*(1.4+5.5*(1.-exp(-tc*2.2))),fd=dl/fr,tb=fbm(v/fr*2.5+tm*.3);
   vec3 fc=mix(vec3(.62,.5,1.),vec3(1.,.5,.45),exp(-fd*1.3));fc=mix(fc,vec3(1.,.8,.5),exp(-fd*fd*2.2));fc=mix(fc,vec3(1.,.98,.92),exp(-fd*fd*7.));
   c=mix(c,fc,clamp(exp(-fd*fd*1.25)*(.75+.5*tb)*ma*1.2,0.,1.));}
  if(sha>.002){float w=mxr*.02,dd=dl-shr,d2=dl-shr*.62;
   c=mix(c,vec3(1.,.96,.84),exp(-dd*dd/(w*w))*sha);c=mix(c,vec3(.62,.52,1.),exp(-(dd+w*2.)*(dd+w*2.)/(w*w*3.))*sha*.5);
   c=mix(c,vec3(1.,.62,.6),exp(-d2*d2/(w*w*.6))*sha*.6);}}
 c=mix(c,vec3(1.,.985,.93),clamp(fl*(.62+.5*exp(-dn*dn*5.)),0.,1.));
 float g=fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);gl_FragColor=vec4(c+(g-.5)/96.,1.);}`;
  /* Hạt = vì sao. a_i < u_n: sao của hình xoắn ốc; a_i >= u_n: bụi sao xa (phủ cả hero, trôi rất chậm, lệch nhẹ theo chuột).
     u_bang 0→1 (~4,6 giây): bung từ tâm (vệt sáng theo hướng bay) → lơ lửng → bị hút xoáy về hình xoắn ốc (đường cong, sao xa vào sau).
     u_bang = 1: đúng hình xoắn ốc đang xoay (u_rot), không đổi so với trước. */
  const VS_P=`attribute float a_i;uniform float u_br,u_n,u_dn,u_bin,u_t,u_bang,u_dpr,u_R,u_mr,u_mp,u_rot,u_lo,u_ss;uniform vec2 u_res,u_ctr,u_m,u_tilt;
varying float v_al,v_mix,v_soft,v_gold,v_str,v_glow;varying vec2 v_dir;const float PHI=1.61803399,TAU=6.28318531;
float hh(float n){return fract(sin(n*12.9898+4.1414)*43758.5453);}
float eo(float x){x=clamp(x,0.,1.);return 1.-(1.-x)*(1.-x)*(1.-x);}
float eio(float x){x=clamp(x,0.,1.);return x<.5?4.*x*x*x:1.-pow(-2.*x+2.,3.)*.5;}
void main(){float h1=hh(a_i),h2=hh(a_i*1.7+3.),h3=hh(a_i*2.3+7.),h4=hh(a_i*3.1+11.);
 if(a_i>=u_n+u_dn){float j=a_i-u_n-u_dn,sd=mod(j,2.),ti=floor(j*.5),q=clamp(u_bin-ti*.009,0.,1.);
  float r=2.3*pow(1.-q,1.2),th=3.14159*(1.-sd)+14.*q*q;vec2 p2=vec2(cos(th)*r*(1.5-.5*q),sin(th)*r*cos(.3));
  gl_Position=vec4((u_ctr+p2*u_R)/u_res*2.-1.,0.,1.);float head=1.-step(.5,ti),fall=1.-ti/36.;
  gl_PointSize=max(1.,(head*72.+(1.-head)*16.*fall)*(1.+.4*q)*u_dpr);
  v_al=step(.0001,u_bin)*(1.-step(.0005,u_bang))*step(.0001,q+head*.001)*mix(.7*fall,1.,head)*(.85+.15*sin(u_t*9.+sd*3.));
  v_soft=1.-head;v_glow=head;v_gold=head*.45;v_mix=0.;v_str=0.;v_dir=vec2(1.,0.);return;}
 if(a_i>=u_n){vec2 q=vec2(h1,h2)*2.-1.;q+=vec2(sin(u_t*.05+h3*TAU),cos(u_t*.04+h1*TAU))*.012;q-=(u_m/u_res*2.-1.)*.012*(.4+h3);
  gl_Position=vec4(q,0.,1.);gl_PointSize=max(1.,(.9+1.7*h3*h3)*u_dpr);
  float tw=.5+.5*sin(u_t*(.5+h4*1.8)+h1*TAU);v_al=(.2+.35*h4)*(.45+.55*tw)*clamp(u_bang*4.+u_bin*2.+.15,0.,1.);
  v_soft=0.;v_mix=h2;v_gold=step(.78,h4);v_str=0.;v_glow=0.;v_dir=vec2(1.,0.);return;}
 float k=(a_i+.5)/u_n,rr=sqrt(k);
 float rs=mix(.012,1.,k),ths=log(rs)/log(PHI)*(TAU*.25)+.227+u_rot+sin(u_t*.2)*.06,br=1.+.04*u_br*sin(u_t*1.3-rs*7.);
 vec2 sp=(vec2(cos(ths),sin(ths))*rs*br*(1.+(h1+h2-1.)*.09)+(vec2(h2,h3)-.5)*.012)*u_ss;
 vec2 p=sp,dir=vec2(1.,0.);float str=0.,boost=0.;
 if(u_bang<1.){float ang=h1*TAU,dist=.3+2.3*pow(h2,.75),dn=(dist-.3)/2.3;vec2 dv=vec2(cos(ang)*1.45,sin(ang));
  float b1=eo(u_bang/.16);vec2 ex=dv*dist*b1+vec2(sin(u_t*.9+h3*TAU),cos(u_t*.7+h4*TAU))*.05*smoothstep(.1,.3,u_bang);
  float s=eio((u_bang-.3-.2*dn)/.48),rE=length(ex),aE=atan(ex.y,ex.x),rF=length(sp),aF=atan(sp.y,sp.x);
  float dA=mod(aF-aE,TAU)+TAU*.5,a=aE+dA*s,r=mix(rE,rF,s);p=vec2(cos(a),sin(a))*r;
  float burst=1.-smoothstep(.03,.2,u_bang),suck=sin(s*3.14159);str=min(1.2,burst*1.3+suck*.9);
  dir=burst>suck?dv:(rF-rE)*vec2(cos(a),sin(a))+r*dA*vec2(-sin(a),cos(a));boost=3.2*(1.-smoothstep(0.,.2,u_bang));}
 float z=(h2-.5)*.06,cx=cos(u_tilt.x),sx=sin(u_tilt.x),cy=cos(u_tilt.y),sy=sin(u_tilt.y);
 vec3 P=vec3(p.x,p.y*cx-z*sx,p.y*sx+z*cx);P=vec3(P.x*cy+P.z*sy,P.y,-P.x*sy+P.z*cy);
 float pe=1./(1.-P.z*.382);vec2 scr=u_ctr+P.xy*pe*u_R;
 vec2 dm=scr-u_m;float dd=length(dm),f=exp(-dd*dd/(u_mr*u_mr))*u_mp;scr+=dm/(dd+1.)*f*u_mr*.382;
 gl_Position=vec4(scr/u_res*2.-1.,0.,1.);
 float bok=step(.955,h3),glw=step(.9,h3)*(1.-bok);
 float sz=mix(mix(1.4,5.,rr)*(.55+.9*h1*h1),12.+16.*h2,bok)*(1.+glw*1.8)*(1.+f*.9)*(1.+2.2*str);
 gl_PointSize=max(1.,sz*u_dpr*pe);
 float tw=.55+.45*pow(.5+.5*sin(u_t*(.7+h4*2.3)+h1*TAU),2.);
 v_al=tw*mix(.9,.14,bok)*mix(u_lo,1.,smoothstep(.3,.62,scr.y/u_res.y))*smoothstep(0.,.03,u_bang)*(1.+boost);
 v_soft=bok;v_glow=glw;v_gold=step(.86,h4);v_str=str;v_dir=normalize(vec2(dir.x,-dir.y)+1e-5);
 v_mix=clamp(1.-sqrt(rs)+(h2-.5)*.2,0.,1.);}`;
  const FS_P=`precision mediump float;uniform vec3 k0,k1,k2;varying float v_al,v_mix,v_soft,v_gold,v_str,v_glow;varying vec2 v_dir;
void main(){vec2 q=gl_PointCoord-.5;if(v_str>.01)q=vec2(dot(q,v_dir),dot(q,vec2(-v_dir.y,v_dir.x))*(1.+2.2*v_str));
 float d=length(q)*2.,a=mix(smoothstep(1.,.5,d),smoothstep(1.,0.,d)*.8,v_soft);
 if(v_glow>.5){float h=max(1.-d,0.);a=smoothstep(.28,.04,d)+.85*h*sqrt(h);}
 a*=v_al;vec3 c=v_mix<.618?mix(k0,k1,v_mix/.618):mix(k1,k2,(v_mix-.618)/.382);c=mix(c,vec3(1.,.86,.6),v_gold*.7);gl_FragColor=vec4(c*a,a);}`;
  let pA,pB,pB0,pP,uA,uB,uB0,uP,tri,idx,fbo,tex,fw=0,fh=0;
  const mk=(vs,fs,attr)=>{const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o)||'shader');return o};
    const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.bindAttribLocation(p,0,attr);gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');return p};
  const U=(p,names)=>{const o={};names.split(' ').forEach(k=>o[k]=gl.getUniformLocation(p,k));return o};
  const build=()=>{
    pA=mk(VS,FS_A,'a');pB=mk(VS,FS_B,'a');pB0=mk(VS,FS_B0,'a');pP=mk(VS_P,FS_P,'a_i');
    uA=U(pA,'r m ctr t sc c0 c1 c2 c3');uB=U(pB,'tx r ctr s1 s2 s1b s2b fl sr sa ma shr sha tm tc');uB0=U(pB0,'tx r');uP=U(pP,'u_br u_n u_dn u_bin u_t u_bang u_dpr u_R u_mr u_mp u_rot u_lo u_ss u_res u_ctr u_m u_tilt k0 k1 k2');
    tri=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,tri);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const ia=new Float32Array(N+DN+2*TR);for(let i=0;i<N+DN+2*TR;i++)ia[i]=i;idx=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,idx);gl.bufferData(gl.ARRAY_BUFFER,ia,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);tex=gl.createTexture();fbo=gl.createFramebuffer();fw=fh=0;
  };
  try{build()}catch(e){console.info('[hero] WebGL không dựng được, chuyển sang Canvas2D');fallback();return}
  /* màu theo token, đổi khi đổi theme */
  const hex=v=>{v=v.trim();if(v[0]!=='#'||v.length<7)return[.9,.9,.9];return[1,3,5].map(i=>parseInt(v.slice(i,i+2),16)/255)};
  const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  let col={},dark=false;
  const colors=()=>{const cs=getComputedStyle(root),c=k=>hex(cs.getPropertyValue(k));dark=isDark();
    const acc=c('--accent'),lav=c('--lav'),peach=c('--peach'),mist=c('--mist');
    col={c0:c('--bg'),c1:lav,c2:peach,c3:mist,k0:acc,k1:dark?mix(acc,mist,.5):mix(acc,lav,.382),k2:mix(acc,peach,.5)}};
  colors();document.addEventListener('dl:theme',()=>{colors();fresh=true;if(!running)draw()});
  /* trạng thái */
  let dpr=Math.min(devicePixelRatio||1,1.5),fq=small?.3:.25,ema=16.7,warm=0,lowQ=false;
  let W=0,H=0,cw=0,ch=0,t=20,rot=0,spd=0,fc=0,fresh=true,last=0,mx=.618,my=.382,tx=.618,ty=.382,mp=0,mpt=0,sc=0,running=false,vis=true,raf=0,lost=false,covered=false;
  let bang=0,bin=0,introAt=null;const smoothstep01=x=>{x=clamp(x);return x*x*(3-2*x)}; // mở đầu: sao bung ra rồi bị hút về hình xoắn ốc (giảm chuyển động: bỏ qua)
  /* mắt xoắn ốc = tâm khung #heroArt (cột 61.8% của hero). Đo bằng offsetLeft/Top, chỉ khi đổi kích thước;
     bán kính theo khung #heroArt. Không đọc layout trong vòng vẽ. */
  const box=$('#heroArt'),art={x:.67,y:.5,r:0};
  const place=()=>{if(!box)return;let x=box.offsetWidth/2,y=box.offsetHeight/2,e=box;
    while(e&&e!==sec){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent}
    if(e!==sec||!sec.offsetWidth)return;art.x=x/sec.offsetWidth;art.y=y/sec.offsetHeight;art.r=Math.min(box.offsetWidth,box.offsetHeight)/2;if(!running)draw()};
  const size=()=>{const w=Math.max(2,Math.round(cw*dpr)),h=Math.max(2,Math.round(ch*dpr));
    if(w!==W||h!==H){W=cv.width=w;H=cv.height=h}
    const a=Math.max(2,Math.round(cw*fq)),b=Math.max(2,Math.round(ch*fq));
    if(a!==fw||b!==fh){fw=a;fh=b;fresh=true;gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,fw,fh,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0)}};
  const draw=()=>{if(lost||!cw)return;size();
    const narrow=cw<760,cxn=art.x,cyn=art.y,R=(art.r?art.r*.96:narrow?cw*.66:Math.min(ch*.42,cw*.36))*dpr;
    /* nền aurora đổi rất chậm: vẽ lại vào FBO cách một khung (đỡ một nửa tải GPU), vòng hạt vẫn vẽ mỗi khung */
    gl.disable(gl.BLEND);gl.bindBuffer(gl.ARRAY_BUFFER,tri);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    if(!running||(fc++&1)===0||fresh){fresh=false;gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.viewport(0,0,fw,fh);gl.useProgram(pA);
    gl.uniform2f(uA.r,fw,fh);gl.uniform2f(uA.m,mx-.5,.5-my);gl.uniform2f(uA.ctr,cxn,1-cyn);gl.uniform1f(uA.t,t);gl.uniform1f(uA.sc,sc);
    gl.uniform3fv(uA.c0,col.c0);gl.uniform3fv(uA.c1,col.c1);gl.uniform3fv(uA.c2,col.c2);gl.uniform3fv(uA.c3,col.c3);gl.drawArrays(gl.TRIANGLES,0,3)}
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);const S=starState(introAt==null?null:t-introAt,W,H,cxn*W,(1-cyn)*H);shake(S.shake);const fx=S.sa>0||S.ma>.002||S.sha>.002||S.fl>.002||(S.tc>=0&&S.tc<3);
    if(!fx){gl.useProgram(pB0);gl.uniform1i(uB0.tx,0);gl.uniform2f(uB0.r,W,H)}else{gl.useProgram(pB);gl.uniform1i(uB.tx,0);gl.uniform2f(uB.r,W,H);gl.uniform2f(uB.ctr,cxn*W,(1-cyn)*H);
    gl.uniform2f(uB.s1,S.x1,S.y1);gl.uniform2f(uB.s2,S.x2,S.y2);gl.uniform2f(uB.s1b,S.bx1,S.by1);gl.uniform2f(uB.s2b,S.bx2,S.by2);gl.uniform1f(uB.tc,S.tc);gl.uniform1f(uB.sr,S.rs);gl.uniform1f(uB.sa,S.sa);gl.uniform1f(uB.ma,S.ma);gl.uniform1f(uB.shr,S.shr);gl.uniform1f(uB.sha,S.sha);gl.uniform1f(uB.tm,t);
    gl.uniform1f(uB.fl,(dark?.75:1)*(RM?.5:1)*S.fl);}gl.drawArrays(gl.TRIANGLES,0,3);
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,dark?gl.ONE:gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(pP);
    gl.bindBuffer(gl.ARRAY_BUFFER,idx);gl.vertexAttribPointer(0,1,gl.FLOAT,false,0,0);
    gl.uniform1f(uP.u_br,RM?0:1);gl.uniform1f(uP.u_n,N);gl.uniform1f(uP.u_t,t);gl.uniform1f(uP.u_bang,bang);gl.uniform1f(uP.u_bin,bin);gl.uniform1f(uP.u_dn,DN);gl.uniform1f(uP.u_dpr,dpr);gl.uniform1f(uP.u_R,R);
    gl.uniform1f(uP.u_mr,110*dpr);gl.uniform1f(uP.u_mp,mp);gl.uniform1f(uP.u_rot,rot);gl.uniform1f(uP.u_lo,narrow?.82:.78);gl.uniform1f(uP.u_ss,narrow?1.05:1.2);
    gl.uniform2f(uP.u_res,W,H);gl.uniform2f(uP.u_ctr,cxn*W,(1-cyn)*H);gl.uniform2f(uP.u_m,mx*W,(1-my)*H);gl.uniform2f(uP.u_tilt,.3+(my-.5)*.382,(mx-.5)*.5);
    gl.uniform3fv(uP.k0,col.k0);gl.uniform3fv(uP.k1,col.k1);gl.uniform3fv(uP.k2,col.k2);gl.drawArrays(gl.POINTS,0,N+DN);
  };
  const loop=now=>{raf=0;if(!running)return;const dt=Math.min(.05,(now-last)/1000||.016);last=now;
    /* máy yếu: sau 2 giây nếu khung trung bình > 20ms thì hạ độ phân giải nền + mật độ điểm ảnh một lần */
    ema+=(dt*1000-ema)*.08;if(!lowQ&&(warm+=dt)>2&&ema>20){lowQ=true;fq*=.6;dpr=Math.min(dpr,1)*.75;fresh=true}
    t+=dt;if(introAt!=null){const it=t-introAt;bin=clamp(it/INTRO_BIN);bang=clamp((it-INTRO_BIN)/INTRO_BANG)}spd+=((RM?.157:.25)-spd)*Math.min(1,dt*.4);rot+=dt*spd;mx+=(tx-mx)*.06;my+=(ty-my)*.06;mp+=(mpt-mp)*.08;draw();raf=requestAnimationFrame(loop)};
  const setRun=()=>{const on=vis&&!covered&&!document.hidden&&!lost;if(on===running)return;running=on;if(on&&!raf){last=performance.now();raf=requestAnimationFrame(loop)}};
  /* Hình nền tự chuyển động, không phụ thuộc thao tác cuộn (tránh giật khi vuốt) */
  if(fine)addEventListener('pointermove',e=>{const r=sec.getBoundingClientRect();if(e.clientY>r.bottom){mpt=0;return}tx=clamp((e.clientX-r.left)/r.width);ty=clamp((e.clientY-r.top)/r.height);mpt=1},{passive:true});
  new IntersectionObserver(([en])=>{vis=en.isIntersecting;setRun()}).observe(sec);
  document.addEventListener('visibilitychange',setRun);
  document.addEventListener('dl:cover',e=>{covered=!!(e.detail&&e.detail.on);setRun()}); // phòng mẫu toàn màn hình đang che trang: tạm dừng cảnh WebGL
  /* kích thước canvas + tâm logo: chỉ đo khi đổi kích thước (ResizeObserver), vòng vẽ không đọc layout */
  new ResizeObserver(([en])=>{const r=en.contentRect;cw=r.width;ch=r.height;place();if(!running)draw()}).observe(cv);
  if(box)new ResizeObserver(place).observe(box);addEventListener('load',place);document.fonts&&document.fonts.ready.then(place);
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;running=false;fallback()});
  cv.addEventListener('webglcontextrestored',()=>{try{build();lost=false;fb2&&fb2.stop();sec.classList.remove('no-gl');sec.classList.add('gl-on');fresh=true;setRun()}catch(e){fallback()}});
  draw();sec.classList.add('gl-on');setRun();
  if(!sec.classList.contains('no-gl'))D.heroState=()=>({rot:+rot.toFixed(3),bin:+bin.toFixed(3),bang:+bang.toFixed(3),lowQ,mode:'webgl'});diag('webgl');introHooks.push(()=>{if(lost)return;introAt=t;bin=0;bang=0;fresh=true;setRun()});if(introFired){introAt=t-INTRO_BIN-INTRO_BANG;bin=bang=1} /* để kiểm thử */
});
safe('hero-intro',()=>{
  const pre=$('#pre'),h1=$('#heroTitle');let left=0;
  try{const an=pre&&pre.getAnimations?pre.getAnimations()[0]:null;if(an&&an.playState!=='finished')left=Math.max(0,686-(an.currentTime||0))/1000}catch(e){}
  const covered=left>0;heroIntro(covered?left:0);
  if(RM||!g||!covered)return;
  const tl=g.timeline({delay:left});
  if(h1&&window.SplitText){
    const sp=window.SplitText.create(h1,{type:'words,chars',wordsClass:'dl-w',charsClass:'dl-c'});
    const em=$('em',h1);if(em){const er=em.getBoundingClientRect();$$('.dl-c',em).forEach(c=>{const r=c.getBoundingClientRect();c.style.backgroundSize=er.width+'px 100%';c.style.backgroundPosition=(er.left-r.left)+'px 0'})}
    tl.from(sp.chars,{yPercent:110,rotate:6.18,opacity:0,duration:1.11,ease:'expo.out',stagger:.0262,onComplete:()=>{try{sp.revert()}catch(e){}}},0);
  }
  tl.from('.hero-main>.lead,.hero-cta',{y:26,opacity:0,duration:1.11,ease:'expo.out',stagger:.1,clearProps:'all'},.262)
    .from('#head',{yPercent:-100,duration:1.11,ease:'expo.out',clearProps:'transform'},.1);
});

/* ═════════ MARQUEE: 2 hàng ngược chiều, tốc độ theo vận tốc cuộn ═════════ */
safe('marquee',()=>{
  const sec=$('.mq');if(!sec)return;
  const rows=$$('.mq-row',sec).map(row=>{const tr=$('.mq-track',row),base=[...tr.children],n=base.length,w0=tr.scrollWidth;
    const copies=Math.ceil(innerWidth/Math.max(1,w0))+1;for(let i=0;i<copies;i++)base.forEach(el=>{const c=el.cloneNode(true);c.setAttribute('aria-hidden','true');tr.append(c)});
    const r={tr,n,w:w0,dir:+row.dataset.dir||-1,x:0};r.measure=()=>{r.w=Math.max(1,tr.children[n].offsetLeft-tr.children[0].offsetLeft)};r.measure();return r});
  if(RM||!g)return;
  let vis=false,lastY=scrollY,vel=0;
  new IntersectionObserver(([en])=>{vis=en.isIntersecting}).observe(sec);
  const remeasure=()=>rows.forEach(r=>r.measure());
  addEventListener('resize',remeasure,{passive:true});if(document.fonts&&document.fonts.ready)document.fonts.ready.then(remeasure);
  g.ticker.add((_,dms)=>{const dt=Math.min(100,Math.max(1,dms))/1000,y=scrollY,v=(y-lastY)/dt;lastY=y;vel+=(v-vel)*(1-Math.exp(-dt*6.18));if(!vis)return;
    const boost=clamp(Math.abs(vel)/1110,0,PHI*PHI*PHI),sign=vel<-26?-1:1,skew=(clamp(vel/2906,-1,1)*-6.18).toFixed(2);
    rows.forEach((r,i)=>{r.x+=r.dir*sign*(i?42:68)*(1+boost*PHI)*dt;
      if(r.x<=-r.w)r.x+=r.w;if(r.x>0)r.x-=r.w;r.tr.style.transform=`translate3d(${r.x.toFixed(2)}px,0,0) skewX(${skew}deg)`})});
});

/* ═════════ DỊCH VỤ: ánh sáng theo chuột + motion icon ═════════ */
safe('services',()=>{
  const cards=$$('.svc');if(!cards.length)return;
  const play=c=>{c.classList.remove('go');void c.offsetWidth;c.classList.add('go')};
  cards.forEach(c=>{
    if(fine){c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
      c.addEventListener('pointerenter',()=>play(c))}
    c.addEventListener('focus',()=>play(c));
  });
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){play(en.target);io.unobserve(en.target)}}),{threshold:.382});
  cards.forEach(c=>io.observe(c));
});

/* ═════════ QUY TRÌNH: ghim + cuộn ngang (sticky), đường nối tự vẽ, kết bằng xoắn ốc vàng ═════════ */
safe('process',()=>{
  const sec=$('#quy-trinh'),pin=$('#procPin'),view=$('#procView'),track=$('#procTrack'),svg=$('#procLine');if(!sec||!track||!svg)return;
  const steps=$$('.step',track),end=$('.proc-end',track),fg=$('.fg',svg),bg=$('.bg',svg),now=$('#procNow'),bar=$('#procBar');if(!steps.length)return;
  const SP=[[55,0],[21,34],[0,13],[13,0],[21,8],[16,13],[13,10],[15,8],[16,9],[15,10]],SR=[34,21,13,8,5,3,2,1,1];
  let L=1,fr=[],dist=0,prog=0,pinned=false;
  const update=p=>{prog=clamp(p);const f0=fr[0]||0,dr=f0+(1-f0)*prog;fg.style.strokeDashoffset=(L*(1-dr)).toFixed(1);
    let cur=0;steps.forEach((s,i)=>{const on=dr>=fr[i]-.004;s.classList.toggle('on',on);if(on)cur=i});
    if(now)now.textContent='0'+(cur+1);if(bar)bar.style.transform=`scaleX(${prog.toFixed(4)})`};
  const layout=()=>{
    const w=track.scrollWidth,h=track.offsetHeight;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const pts=steps.map(s=>{const n=$('.node',s);return[s.offsetLeft+n.offsetLeft+n.offsetWidth/2,s.offsetTop+n.offsetTop+n.offsetHeight/2]});
    let d=`M0 ${pts[0][1]}L${pts[0][0]} ${pts[0][1]}`;
    for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],dx=(b[0]-a[0])*.5;d+=`C${a[0]+dx} ${a[1]} ${b[0]-dx} ${b[1]} ${b[0]} ${b[1]}`}
    let lineEnd=d;
    if(end){const lp=pts[pts.length-1],h3=$('h3',end),ex=end.offsetLeft+26,ey=pts[0][1],avail=(end.offsetTop+(h3?h3.offsetTop:h))-ey-26,u=clamp(avail/55,1.6,4.24),dx=(ex-lp[0])*.5;
      d+=`C${lp[0]+dx} ${lp[1]} ${ex-dx} ${ey} ${ex} ${ey}`;lineEnd=d;
      for(let i=1;i<SP.length;i++)d+=`A${(SR[i-1]*u).toFixed(2)} ${(SR[i-1]*u).toFixed(2)} 0 0 1 ${(ex+SP[i][1]*u).toFixed(2)} ${(ey+(55-SP[i][0])*u).toFixed(2)}`}
    bg.setAttribute('d',lineEnd);fg.setAttribute('d',d);L=fg.getTotalLength()||1;fg.style.strokeDasharray=L.toFixed(1);
    fr=pts.map(p=>{let lo=0,hi=L;for(let k=0;k<18;k++){const m=(lo+hi)/2;fg.getPointAtLength(m).x<p[0]?lo=m:hi=m}return lo/L});
    dist=Math.max(0,w-view.clientWidth);if(pinned)sec.style.setProperty('--proc-dist',dist+'px');
    update(pinned?prog:(dist?view.scrollLeft/dist:0));
  };
  view.addEventListener('scroll',()=>{if(!pinned&&dist)update(view.scrollLeft/dist)},{passive:true});
  layout();(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(layout);
  if(!g||!ST||RM){addEventListener('resize',layout,{passive:true});return}
  ST.addEventListener('refreshInit',layout);
  g.matchMedia().add('(min-width:1024px) and (min-height:600px)',()=>{
    pinned=true;sec.classList.add('pinned');view.scrollLeft=0;layout();
    const tw=g.to(track,{x:()=>-dist,ease:'none',scrollTrigger:{trigger:pin,start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true,onUpdate:s=>update(s.progress)}});
    return()=>{pinned=false;tw.scrollTrigger&&tw.scrollTrigger.kill();tw.kill();g.set(track,{clearProps:'transform'});sec.classList.remove('pinned');sec.style.removeProperty('--proc-dist');layout()};
  });
});

/* ═════════ BÁO GIÁ: tab dính + scrollspy, vuốt gói trên điện thoại, bảng so sánh, tự tính giá ═════════ */
safe('pricing',()=>{
  const tabsIn=$('#ptabs');if(!tabsIn)return;
  const tabs=$$('.ptab',tabsIn),pill=$('.ptab-pill',tabsIn);let active=null;
  const setTab=(id,scroll=true)=>{const t=tabs.find(x=>x.dataset.t===id);if(!t)return;active=id;
    tabs.forEach(x=>{const on=x===t;x.classList.toggle('on',on);x.setAttribute('aria-selected',String(on))});
    if(pill){pill.style.setProperty('--x',t.offsetLeft+'px');pill.style.setProperty('--w',t.offsetWidth+'px')}
    if(scroll&&tabsIn.scrollWidth>tabsIn.clientWidth)tabsIn.scrollTo({left:t.offsetLeft-16,behavior:RM?'auto':'smooth'})};
  const repill=()=>active&&setTab(active,false);
  if(tabs[0])setTab(tabs[0].dataset.t,false);
  addEventListener('resize',repill,{passive:true});if(document.fonts&&document.fonts.ready)document.fonts.ready.then(repill);
  tabsIn.addEventListener('click',e=>{const b=e.target.closest('.ptab');if(b){setTab(b.dataset.t);go('#p-'+b.dataset.t)}});
  if(ST)$$('.pcat').forEach(c=>ST.create({trigger:c,start:'top 45%',end:'bottom 45%',onToggle:s=>{if(s.isActive)setTab(c.dataset.id)}}));
  /* vuốt gói trên điện thoại: chấm chỉ vị trí, mở sẵn ở gói phổ biến */
  $$('.pcat').forEach(c=>{const box=$('.tiers',c),dots=$$('.tier-dots i',c),cards=$$('.tier',c);if(!box||!dots.length)return;
    const cur=()=>{const m=box.scrollLeft+box.clientWidth/2;let b=0,bd=1e9;cards.forEach((t,i)=>{const d=Math.abs(t.offsetLeft+t.offsetWidth/2-m);if(d<bd){bd=d;b=i}});dots.forEach((x,i)=>x.classList.toggle('on',i===b))};
    box.addEventListener('scroll',cur,{passive:true});
    const hot=cards.findIndex(t=>t.classList.contains('hot'));
    if(hot>0&&box.scrollWidth>box.clientWidth+4)box.scrollLeft=cards[hot].offsetLeft-(box.clientWidth-cards[hot].offsetWidth)/2;
    cur()});
  /* bảng so sánh thu gọn / mở rộng */
  $$('.cmp-btn').forEach(b=>{const body=document.getElementById(b.getAttribute('aria-controls'));if(!body)return;
    b.addEventListener('click',()=>{const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));
      const done=()=>{if(!open)body.hidden=true;body.style.height=open?'auto':'';D.refresh()};
      if(open)body.hidden=false;
      if(!g||RM){done();return}
      g.killTweensOf(body);
      open?g.fromTo(body,{height:0},{height:'auto',duration:.686,ease:'power3.out',onComplete:done}):g.to(body,{height:0,duration:.424,ease:'power3.inOut',onComplete:done});
      if(open)g.from($$('tbody tr',body),{opacity:0,y:10,duration:.424,ease:'power3.out',stagger:.0262,clearProps:'all'})})});
  /* tự tính giá */
  const list=$('#estList'),total=$('#estTotal'),lines=$('#estLines'),save=$('#estSave'),goBtn=$('#estGo'),combo=$$('#estCombo i');if(!list||!total)return;
  const est={};let shown=0;
  const render=()=>{
    const picked=CATS.filter(c=>est[c.id]>=0).map(c=>({c,t:c.tiers[est[c.id]]})),sum=picked.reduce((a,x)=>a+x.t.p,0),disc=picked.length>=3?Math.round(sum*.1):0,tot=sum-disc;
    lines.innerHTML=picked.length?picked.map(x=>`<div><span>${x.c.name} · ${x.t.n}</span><span>${vnd(x.t.p)}</span></div>`).join('')+(disc?`<div class="disc"><span>${T('Combo {n} hạng mục −10%',{n:picked.length})}</span><span>−${vnd(disc)}</span></div>`:'')+(D.fx(tot)?`<div class="fxl"><span>${T('Quy đổi tham khảo')}</span><span>${D.fx(tot)}</span></div>`:''):'<div><span>'+T('Chưa chọn hạng mục nào')+'</span></div>';
    save.textContent=disc?T('Đã giảm combo 10%: tiết kiệm {v}',{v:vnd(disc)}):T('Combo từ 3 hạng mục: giảm 10%')+(picked.length?' '+T('(chọn thêm {n})',{n:3-picked.length}):'');
    combo.forEach((d,i)=>d.classList.toggle('on',i<picked.length));
    $$('.est-row',list).forEach(r=>r.classList.toggle('sel',est[r.dataset.c]>=0));
    if(g&&!RM){const o={v:shown};g.killTweensOf(total);g.to(o,{v:tot,duration:.686,ease:'power3.out',onUpdate:()=>{total.textContent=vnd(Math.round(o.v/1000)*1000)}});
      g.fromTo(total,{scale:1.062},{scale:1,duration:.424,ease:'power3.out',transformOrigin:'0 50%'})}else total.textContent=vnd(tot);
    shown=tot;
    if(goBtn)goBtn.dataset.summary=picked.length?picked.map(x=>`${x.c.name} (${x.t.n})`).join(', ')+' — '+T('tổng dự kiến')+' '+D.vndx(tot)+(disc?' '+T('(đã giảm combo 10%)'):''):'';
  };
  const choose=(c,i)=>{est[c]=i;const s=$(`.seg[data-c="${c}"]`,list);if(s)$$('button',s).forEach(x=>{const on=+x.dataset.i===i;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))})};
  list.addEventListener('click',e=>{const b=e.target.closest('.seg button');if(!b)return;choose(b.parentElement.dataset.c,+b.dataset.i);render()});
  [['ai',1],['web',1]].forEach(([c,i])=>{if(CATS.find(x=>x.id===c))choose(c,i)});render();
});

/* ═════════ FAQ ═════════ */
safe('faq',()=>{
  const items=$$('#faqList details');if(!items.length)return;
  const set=(d,open)=>{const a=$('.a',d);if(d.classList.contains('is-open')===open)return;d.classList.toggle('is-open',open);
    if(!g||RM){d.open=open;return}
    g.killTweensOf(a);
    if(open){d.open=true;g.fromTo(a,{height:0},{height:'auto',duration:.686,ease:'power3.out',onComplete:()=>{a.style.height='';D.refresh()}})}
    else g.to(a,{height:0,duration:.424,ease:'power3.inOut',onComplete:()=>{d.open=false;a.style.height='';D.refresh()}})};
  items.forEach(d=>{d.classList.add('js');d.removeAttribute('name');if(d.open)d.classList.add('is-open');
    $('summary',d).addEventListener('click',e=>{e.preventDefault();const open=!d.classList.contains('is-open');if(open)items.forEach(o=>o!==d&&set(o,false));set(d,open)})});
  items[0].open=true;items[0].classList.add('is-open');
});

/* ═════════ LIÊN HỆ ═════════ */
safe('contact',()=>{
  const cf=$('#cf');if(!cf)return;
  const sel=$('#f-svc'),name=$('#f-name'),phone=$('#f-phone'),m=$('#formMsg'),done=$('#cfDone');
  sel.addEventListener('change',()=>pickBanner(sel.value&&sel.value!=='combo'?sel.value:sel.value==='combo'?T('Cấu hình tự tính'):'',false));
  $('#cfPickX').addEventListener('click',()=>{sel.value='';pickBanner('')});
  [name,phone].forEach(i=>i.addEventListener('input',()=>{i.closest('.field').classList.remove('bad');m.textContent=''}));
  cf.addEventListener('submit',e=>{e.preventDefault();
    const n=name.value.trim(),ph=phone.value.trim();
    name.closest('.field').classList.toggle('bad',!n);phone.closest('.field').classList.toggle('bad',!ph);
    if(!n||!ph){m.textContent=T('Vui lòng nhập họ tên và số điện thoại để chúng tôi liên hệ lại.');(n?phone:name).focus();return}
    /* form chưa gửi đi đâu: soạn sẵn nội dung để khách chép và dán qua Zalo */
    const svc=sel.value==='combo'?T('Cấu hình tự tính'):sel.value,pr=priceOf(svc),bud=$('#f-budget'),raw=$('#f-msg').value.split('\n').map(l=>l.trim()).filter(Boolean);
    const RE=new RegExp('^(?:Mẫu tham khảo|'+T('Mẫu tham khảo').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'):\\s*'),smp=raw.filter(l=>RE.test(l)).map(l=>l.replace(RE,'')),rest=raw.filter(l=>!RE.test(l)),req=$('#cfReq');
    if(req)req.textContent=[T('YÊU CẦU TƯ VẤN · DREAM LABS'),T('Họ tên:')+' '+n,T('SĐT / Zalo:')+' '+ph,T('Gói quan tâm:')+' '+(svc?svc+(pr?' ('+pr+')':''):T('Chưa chọn, cần tư vấn')),bud?T('Ngân sách:')+' '+bud.value:'',smp.length?T('Mẫu tham khảo')+': '+smp.join('; '):'',T('Mô tả:')+' '+(rest.join(' / ')||T('(chưa ghi)'))].filter(Boolean).join('\n');
    m.textContent='';$('#cfDoneName').textContent=n;done.hidden=false;done.scrollTop=0;
    if(g&&!RM){g.fromTo(done,{clipPath:'circle(0% at 50% 100%)'},{clipPath:'circle(150% at 50% 100%)',duration:.686,ease:'power3.inOut',clearProps:'clipPath'});
      g.from(done.children,{y:26,opacity:0,duration:.686,ease:'expo.out',stagger:.1,delay:.262,clearProps:'all'})}
    $('#cfAgain').focus({preventScroll:true});
    const top=cf.getBoundingClientRect().top;if(top<(head?head.offsetHeight:0)||top>innerHeight*.382)D.scrollTo(cf,{extra:16})});
  $('#cfAgain').addEventListener('click',()=>{done.hidden=true;name.focus({preventScroll:true})});
  /* "Mở Zalo": chép sẵn nội dung rồi để liên kết mở như bình thường */
  const zl=$('#cfZalo');if(zl)zl.addEventListener('click',()=>{const r=$('#cfReq');r&&copyText(r.textContent,null)});
});

/* ═════════ FOOTER: chữ khổng lồ parallax + xoắn ốc vàng vẽ theo cuộn ═════════ */
safe('footer',()=>{
  const ft=$('.foot');if(!ft||!g||!ST||RM)return;
  if($('#giant'))g.fromTo('#giant',{xPercent:0},{xPercent:-38.2,ease:'none',scrollTrigger:{trigger:ft,start:'top bottom',end:'bottom bottom',scrub:true}});
});

D.refresh();
});
})();
