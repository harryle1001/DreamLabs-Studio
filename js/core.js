/* DreamLab core — Session A: chrome (theme, menu, con trỏ, chuyển cảnh, nút nổi), hero WebGL, marquee, dịch vụ, quy trình, báo giá + tự tính giá, FAQ, liên hệ, footer.
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
const vnd=D.vnd,root=document.documentElement,head=$('#head');
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
  const cell=v=>v===1||v===true?'<i class="y" role="img" aria-label="Có"></i>':v===0||v===false||v==null?'<i class="no" role="img" aria-label="Không"></i>':String(v);
  const cmpRows=c=>{
    const rows=[['Giá',...c.tiers.map(t=>`<b>${vnd(t.p)}</b>${t.u||''}${t.plus?' trở lên':''}`)],['Thời gian',...c.tiers.map(t=>t.t)],['Chỉnh sửa / hỗ trợ',...c.tiers.map(t=>t.r)]];
    if(CMP[c.id])rows.push(...CMP[c.id]);
    else{const all=[];c.tiers.forEach(t=>t.f.forEach(f=>{const s=typeof f==='string'?f:f.x;if(!all.includes(s))all.push(s)}));all.forEach(s=>rows.push([s,...c.tiers.map(t=>t.f.includes(s)?1:0)]))}
    return rows};
  tabs.insertAdjacentHTML('beforeend',CATS.map((c,i)=>`<button class="ptab${i?'':' on'}" type="button" role="tab" data-t="${c.id}" aria-selected="${!i}">${c.name}</button>`).join(''));
  body.innerHTML=CATS.map(c=>`<div class="pcat" id="p-${c.id}" data-id="${c.id}">
   <div class="pcat-h" data-reveal><h3>${icoPlain(c.id)}${c.name}</h3><p>${c.desc}</p></div>
   <div class="tiers" data-stagger>${c.tiers.map(t=>`<article class="tier${t.hot?' hot':''}" data-tilt>
     ${t.hot?'<span class="badge">Phổ biến nhất</span>':''}<span class="tn">${t.n}</span>
     <div class="tprice"><span data-count="${t.p}" data-format="vnd">${vnd(t.p)}</span>${t.plus?'<small>trở lên</small>':''}${t.u?`<small>${t.u}</small>`:''}</div>
     <div class="sub"><span>${CLOCK}${t.t}</span><span>${LOOP}${t.r}</span></div>
     <ul>${t.f.map(f=>typeof f==='string'?`<li>${f}</li>`:`<li class="no">${f.x}</li>`).join('')}</ul>
     <a class="btn${t.hot?' primary':''}" href="#lien-he" data-pick="${c.name} — ${t.n}">Chọn gói này</a></article>`).join('')}</div>
   <div class="tier-dots" aria-hidden="true">${c.tiers.map(()=>'<i></i>').join('')}</div>
   <div class="cmp"><button class="cmp-btn" type="button" aria-expanded="false" aria-controls="cmp-${c.id}"><span>So sánh chi tiết ${c.tiers.length} gói ${c.name}</span><i aria-hidden="true"></i></button>
    <div class="cmp-body" id="cmp-${c.id}" hidden><div class="cmp-scroll"><table><thead><tr><th scope="col">Hạng mục</th>${c.tiers.map(t=>`<th scope="col"${t.hot?' class="hot"':''}>${t.n}</th>`).join('')}</tr></thead>
    <tbody>${cmpRows(c).map(r=>`<tr><th scope="row">${r[0]}</th>${c.tiers.map((t,i)=>`<td${t.hot?' class="hot"':''}>${cell(r[i+1])}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div></div>
   <div class="sm-slot" data-sm-slot="${c.id}"></div>
  </div>`).join('');
  const el=$('#estList');
  if(el)el.innerHTML=CATS.map(c=>`<div class="est-row" data-c="${c.id}"><div class="l" id="el-${c.id}">${icoPlain(c.id)}<span>${c.name}<small>${c.tag}</small></span></div>
   <div class="seg" role="group" aria-labelledby="el-${c.id}" data-c="${c.id}"><button type="button" class="on" data-i="-1" aria-pressed="true">Không</button>${c.tiers.map((t,i)=>`<button type="button" data-i="${i}" aria-pressed="false">${t.n}</button>`).join('')}</div></div>`).join('');
  const sel=$('#f-svc');
  if(sel)sel.innerHTML='<option value="">Chưa chắc, cần tư vấn</option>'+CATS.map(c=>`<optgroup label="${c.name}">${c.tiers.map(t=>`<option>${c.name} — ${t.n}</option>`).join('')}</optgroup>`).join('')+'<option value="combo">Cấu hình tự tính</option>';
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
const priceOf=name=>{for(const c of CATS)for(const t of c.tiers)if(norm(c.name+' '+t.n)===norm(name))return vnd(t.p)+(t.u||'')+(t.plus?' trở lên':'');return ''};
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
  const line='Quan tâm: '+t;
  if(msg&&!msg.value.includes(line)){msg.value=(msg.value.trim()?msg.value.trim()+'\n':'')+line;hit(msg)}
  pickBanner(t,true);return false;
}
D.pick=pick;

/* ═════════ MENU ĐIỆN THOẠI ═════════ */
const menu=$('#menu'),burger=$('#burger');
function setMenu(open){
  if(!menu||!burger||menu.classList.contains('open')===open)return;
  if(open){const r=burger.getBoundingClientRect();menu.style.setProperty('--cx',(r.left+r.width/2)+'px');menu.style.setProperty('--cy',(r.top+r.height/2)+'px')}
  menu.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);
  menu.inert=!open;menu.setAttribute('aria-hidden',String(!open));
  burger.setAttribute('aria-expanded',String(open));burger.setAttribute('aria-label',open?'Đóng menu':'Mở menu');
  if(D.lenis)open?D.lenis.stop():D.lenis.start();
}
safe('menu',()=>{
  if(!menu||!burger)return;menu.inert=true;
  burger.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click',e=>{if(e.target.closest('a,[data-sm-open]'))setMenu(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false);setFab(false)}});
  matchMedia('(min-width:861px)').addEventListener('change',e=>{if(e.matches)setMenu(false)});
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
  b.textContent=ok?'Đã chép':'Đã bôi chọn';setTimeout(()=>{b.textContent=label;delete b.dataset.busy},1618);
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
});

/* ═════════ CLICK TOÀN TRANG: data-pick + anchor (capture, chạy trước kit) ═════════ */
document.addEventListener('click',e=>{
  if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||!e.target.closest)return;
  if(D.samples&&e.target.closest('[data-sm-open]'))return; // phòng mẫu (samples.js) tự xử lý
  const p=e.target.closest('[data-pick]');
  if(p){e.preventDefault();pick(p.dataset.pick,p.dataset.pickNote);document.dispatchEvent(new CustomEvent('dl:pick',{detail:{pick:p.dataset.pick,note:p.dataset.pickNote||''}}));D.modal.close();setMenu(false);setFab(false);D.lenis&&D.lenis.start();go('#lien-he');return}
  const a=e.target.closest('a[href^="#"]');if(!a)return;
  const id=a.getAttribute('href').slice(1),el=id&&document.getElementById(id);if(!el)return;
  e.preventDefault();
  if(a.id==='estGo'){const sel=$('#f-svc'),msg=$('#f-msg'),s=a.dataset.summary;if(sel){sel.value='combo';hit(sel)}if(s&&msg)msg.value='Cấu hình: '+s;pickBanner(s?'Cấu hình tự tính':'',true);const dn=$('#cfDone');if(dn)dn.hidden=true}
  D.modal.close();setMenu(false);setFab(false);D.lenis&&D.lenis.start(); /* dialog vừa đóng: mở lại Lenis ngay, nếu chờ sự kiện close thì cuộn mượt bị hủy */
  go(el);
},true);

/* ═════════ HEADER: nền kính, thanh tiến trình, scrollspy ═════════ */
safe('header',()=>{
  if(!head)return;const bar=$('#headProg');
  const onS=()=>head.classList.toggle('solid',scrollY>26);addEventListener('scroll',onS,{passive:true});onS();
  if(!ST)return;
  ST.create({start:0,end:'max',onUpdate:s=>{if(bar)bar.style.transform=`scaleX(${s.progress.toFixed(4)})`}});
  $$('.nav a').forEach(a=>{const el=$(a.getAttribute('href'));if(el)ST.create({trigger:el,start:'top 50%',end:'bottom 50%',onToggle:s=>a.classList.toggle('on',s.isActive)})});
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
    const t=e.target.closest?e.target:null,lb=t&&t.closest('[data-cursor]'),tx=lb&&lb.dataset.cursor;
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
  const small=innerWidth<760,N=small?610:1597,nEl=$('#heroN');
  if(nEl)nEl.textContent=N.toLocaleString('vi-VN')+' hạt';
  const fallback=()=>{sec.classList.add('no-gl');sec.classList.remove('gl-on');const fb=$('#heroFb');if(!fb||fb.firstChild)return;
    let s='';const n=377,GA=Math.PI*(3-Math.sqrt(5));for(let i=0;i<n;i++){const r=Math.sqrt((i+.5)/n),a=i*GA;s+=`<circle cx="${(Math.cos(a)*r).toFixed(4)}" cy="${(Math.sin(a)*r).toFixed(4)}" r="${(.003+.007*r).toFixed(4)}" opacity="${(.26+.36*((i*.618)%1)).toFixed(2)}"/>`}
    fb.innerHTML=`<svg viewBox="-1.05 -1.05 2.1 2.1" aria-hidden="true">${s}</svg>`};
  let gl=null;try{gl=cv.getContext('webgl',{antialias:false,alpha:false,depth:false,stencil:false,powerPreference:'high-performance'})}catch(e){}
  if(!gl){fallback();return}
  const HP='#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';
  const VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS_A=HP+`uniform vec2 r,m,ctr;uniform float t,sc;uniform vec3 c0,c1,c2,c3;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<${small?4:5};i++){v+=a*n(p);p=p*2.+vec2(1.7,9.2);a*=.5;}return v;}
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
  const FS_B=HP+`uniform sampler2D tx;uniform vec2 r;void main(){vec3 c=texture2D(tx,gl_FragCoord.xy/r).rgb;
 float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);gl_FragColor=vec4(c+(g-.5)/96.,1.);}`;
  const VS_P=`attribute float a_i;uniform float u_n,u_t,u_morph,u_in,u_dpr,u_R,u_mr,u_mp,u_fade,u_rot,u_lo,u_ss,u_sc;uniform vec2 u_res,u_ctr,u_m,u_tilt;
varying float v_al,v_mix,v_soft;const float GA=2.39996323,PHI=1.61803399,TAU=6.28318531;
float hh(float n){return fract(sin(n*12.9898+4.1414)*43758.5453);}
void main(){float k=(a_i+.5)/u_n,h1=hh(a_i),h2=hh(a_i*1.7+3.),h3=hh(a_i*2.3+7.);
 float rr=sqrt(k),th=a_i*GA+u_rot;vec2 ph=vec2(cos(th),sin(th))*rr;
 float rs=mix(.012,1.,k),ths=log(rs)/log(PHI)*(TAU*.25)+.227+sin(u_t*.2)*.06;
 vec2 sp=(vec2(cos(ths),sin(ths))*rs*(1.+(h1+h2-1.)*.09)+(vec2(h2,h3)-.5)*.012-vec2(.3,-.19))*u_ss;
 float mm=smoothstep(0.,1.,clamp(u_morph*1.618-h3*.618,0.,1.));
 vec2 p=mix(ph,sp,mm);float sw=sin(mm*3.14159)*.5*(1.-rr),cs=cos(sw),sn=sin(sw);p=vec2(p.x*cs-p.y*sn,p.x*sn+p.y*cs);
 float z=sin(rr*9.-u_t*.8)*.03*(1.-mm)+(h2-.5)*.06;
 float cx=cos(u_tilt.x),sx=sin(u_tilt.x),cy=cos(u_tilt.y),sy=sin(u_tilt.y);
 vec3 P=vec3(p.x,p.y*cx-z*sx,p.y*sx+z*cx);P=vec3(P.x*cy+P.z*sy,P.y,-P.x*sy+P.z*cy);
 float pe=1./(1.-P.z*.382);vec2 scr=u_ctr+P.xy*pe*u_R;
 vec2 dm=scr-u_m;float dd=length(dm),f=exp(-dd*dd/(u_mr*u_mr))*u_mp;scr+=dm/(dd+1.)*f*u_mr*.382;
 gl_Position=vec4(scr/u_res*2.-1.,0.,1.);
 float bok=step(.955,h3);float sz=mix(mix(1.6,5.2,rr)*(.8+.4*h1),12.+16.*h2,bok)*(1.+f*.9);
 gl_PointSize=max(1.,sz*u_dpr*pe);
 float tw=.72+.28*sin(u_t*1.4+h1*TAU),ain=smoothstep(0.,1.,clamp(u_in*1.618-k*.618,0.,1.));
 v_al=ain*tw*mix(.9,.12,bok)*u_fade*mix(u_lo,1.,smoothstep(.3,.62,scr.y/u_res.y+u_sc*1.618));v_soft=bok;v_mix=clamp(1.-mix(rr,sqrt(rs),mm)+(h2-.5)*.2,0.,1.);}`;
  const FS_P=`precision mediump float;uniform vec3 k0,k1,k2;varying float v_al,v_mix,v_soft;
void main(){float d=length(gl_PointCoord-.5)*2.;float a=mix(smoothstep(1.,.5,d),smoothstep(1.,0.,d)*.8,v_soft)*v_al;
 vec3 c=v_mix<.618?mix(k0,k1,v_mix/.618):mix(k1,k2,(v_mix-.618)/.382);gl_FragColor=vec4(c*a,a);}`;
  let pA,pB,pP,uA,uB,uP,tri,idx,fbo,tex,fw=0,fh=0;
  const mk=(vs,fs,attr)=>{const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o)||'shader');return o};
    const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.bindAttribLocation(p,0,attr);gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');return p};
  const U=(p,names)=>{const o={};names.split(' ').forEach(k=>o[k]=gl.getUniformLocation(p,k));return o};
  const build=()=>{
    pA=mk(VS,FS_A,'a');pB=mk(VS,FS_B,'a');pP=mk(VS_P,FS_P,'a_i');
    uA=U(pA,'r m ctr t sc c0 c1 c2 c3');uB=U(pB,'tx r');uP=U(pP,'u_n u_t u_morph u_in u_dpr u_R u_mr u_mp u_fade u_rot u_lo u_ss u_sc u_res u_ctr u_m u_tilt k0 k1 k2');
    tri=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,tri);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const ia=new Float32Array(N);for(let i=0;i<N;i++)ia[i]=i;idx=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,idx);gl.bufferData(gl.ARRAY_BUFFER,ia,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);tex=gl.createTexture();fbo=gl.createFramebuffer();fw=fh=0;
  };
  try{build()}catch(e){console.warn('[hero] WebGL không dựng được, dùng nền CSS:',e.message);fallback();return}
  /* màu theo token, đổi khi đổi theme */
  const hex=v=>{v=v.trim();if(v[0]!=='#'||v.length<7)return[.9,.9,.9];return[1,3,5].map(i=>parseInt(v.slice(i,i+2),16)/255)};
  const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  let col={},dark=false;
  const colors=()=>{const cs=getComputedStyle(root),c=k=>hex(cs.getPropertyValue(k));dark=isDark();
    const acc=c('--accent'),lav=c('--lav'),peach=c('--peach'),mist=c('--mist');
    col={c0:c('--bg'),c1:lav,c2:peach,c3:mist,k0:acc,k1:dark?mix(acc,mist,.5):mix(acc,lav,.382),k2:mix(acc,peach,.5)}};
  colors();document.addEventListener('dl:theme',()=>{colors();if(!running)draw()});
  /* trạng thái */
  const dpr=Math.min(devicePixelRatio||1,1.5),fq=small?.3:.4;
  let W=0,H=0,cw=0,ch=0,t=20,rot=0,last=0,mx=.618,my=.382,tx=.618,ty=.382,mp=0,mpt=0,sc=0,running=false,vis=true,raf=0,lost=false,covered=false;
  const st={in:RM?1:0,morph:RM?0:1};
  const size=()=>{cw=cv.clientWidth;ch=cv.clientHeight;const w=Math.max(2,Math.round(cw*dpr)),h=Math.max(2,Math.round(ch*dpr));
    if(w!==W||h!==H){W=cv.width=w;H=cv.height=h}
    const a=Math.max(2,Math.round(cw*fq)),b=Math.max(2,Math.round(ch*fq));
    if(a!==fw||b!==fh){fw=a;fh=b;gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,fw,fh,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0)}};
  const draw=()=>{if(lost)return;size();
    const narrow=cw<760,cxn=.618,cyn=(narrow?.3:.382)+sc*.9,R=(narrow?cw*.66:Math.min(ch*.42,cw*.36))*dpr;
    const sm=clamp(sc/.3);const morph=Math.max(st.morph,sm*sm*(3-2*sm)),fade=1-clamp((sc-.618)/.382)*.618;
    gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.viewport(0,0,fw,fh);gl.disable(gl.BLEND);gl.useProgram(pA);
    gl.bindBuffer(gl.ARRAY_BUFFER,tri);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.uniform2f(uA.r,fw,fh);gl.uniform2f(uA.m,mx-.5,.5-my);gl.uniform2f(uA.ctr,cxn,1-cyn);gl.uniform1f(uA.t,t);gl.uniform1f(uA.sc,sc);
    gl.uniform3fv(uA.c0,col.c0);gl.uniform3fv(uA.c1,col.c1);gl.uniform3fv(uA.c2,col.c2);gl.uniform3fv(uA.c3,col.c3);gl.drawArrays(gl.TRIANGLES,0,3);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.useProgram(pB);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(uB.tx,0);gl.uniform2f(uB.r,W,H);gl.drawArrays(gl.TRIANGLES,0,3);
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,dark?gl.ONE:gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(pP);
    gl.bindBuffer(gl.ARRAY_BUFFER,idx);gl.vertexAttribPointer(0,1,gl.FLOAT,false,0,0);
    gl.uniform1f(uP.u_n,N);gl.uniform1f(uP.u_t,t);gl.uniform1f(uP.u_morph,morph);gl.uniform1f(uP.u_in,st.in);gl.uniform1f(uP.u_dpr,dpr);gl.uniform1f(uP.u_R,R);
    gl.uniform1f(uP.u_mr,110*dpr);gl.uniform1f(uP.u_mp,mp);gl.uniform1f(uP.u_fade,fade);gl.uniform1f(uP.u_rot,rot);gl.uniform1f(uP.u_lo,narrow?.382:.26);gl.uniform1f(uP.u_ss,narrow?1:1.4);gl.uniform1f(uP.u_sc,sc);
    gl.uniform2f(uP.u_res,W,H);gl.uniform2f(uP.u_ctr,cxn*W,(1-cyn)*H);gl.uniform2f(uP.u_m,mx*W,(1-my)*H);gl.uniform2f(uP.u_tilt,.3+(my-.5)*.382,(mx-.5)*.5);
    gl.uniform3fv(uP.k0,col.k0);gl.uniform3fv(uP.k1,col.k1);gl.uniform3fv(uP.k2,col.k2);gl.drawArrays(gl.POINTS,0,N);
  };
  const loop=now=>{raf=0;if(!running)return;const dt=Math.min(.05,(now-last)/1000||.016);last=now;
    t+=dt;rot+=dt*.05;mx+=(tx-mx)*.06;my+=(ty-my)*.06;mp+=(mpt-mp)*.08;draw();raf=requestAnimationFrame(loop)};
  const setRun=()=>{const on=vis&&!covered&&!document.hidden&&!RM&&!lost;if(on===running)return;running=on;if(on&&!raf){last=performance.now();raf=requestAnimationFrame(loop)}};
  const onScroll=()=>{sc=clamp(scrollY/Math.max(1,sec.offsetHeight));if(RM)draw()};
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  if(fine)addEventListener('pointermove',e=>{const r=sec.getBoundingClientRect();if(e.clientY>r.bottom){mpt=0;return}tx=clamp((e.clientX-r.left)/r.width);ty=clamp((e.clientY-r.top)/r.height);mpt=1},{passive:true});
  new IntersectionObserver(([en])=>{vis=en.isIntersecting;setRun()}).observe(sec);
  document.addEventListener('visibilitychange',setRun);
  document.addEventListener('dl:cover',e=>{covered=!!(e.detail&&e.detail.on);setRun()}); // phòng mẫu toàn màn hình đang che trang: tạm dừng cảnh WebGL
  new ResizeObserver(()=>{if(!running)draw()}).observe(cv);
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;running=false;sec.classList.remove('gl-on')});
  cv.addEventListener('webglcontextrestored',()=>{try{build();lost=false;sec.classList.add('gl-on');RM?draw():setRun()}catch(e){fallback()}});
  draw();sec.classList.add('gl-on');setRun();
  heroIntro=delay=>{if(RM||!g){st.in=1;st.morph=0;return}
    g.to(st,{in:1,duration:1.796,ease:'power2.out',delay});g.to(st,{morph:0,duration:2.906,ease:'power3.inOut',delay:delay+.1})};
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
  tl.from('.hero .eyebrow,.hero-side>*,.hero-foot',{y:26,opacity:0,duration:1.11,ease:'expo.out',stagger:.1,clearProps:'all'},.262)
    .from('.hero-note',{opacity:0,duration:1.11,clearProps:'all'},.686)
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
    lines.innerHTML=picked.length?picked.map(x=>`<div><span>${x.c.name} · ${x.t.n}</span><span>${vnd(x.t.p)}</span></div>`).join('')+(disc?`<div class="disc"><span>Combo ${picked.length} hạng mục −10%</span><span>−${vnd(disc)}</span></div>`:''):'<div><span>Chưa chọn hạng mục nào</span></div>';
    save.textContent=disc?`Đã giảm combo 10%: tiết kiệm ${vnd(disc)}`:`Combo từ 3 hạng mục: giảm 10%${picked.length?` (chọn thêm ${3-picked.length})`:''}`;
    combo.forEach((d,i)=>d.classList.toggle('on',i<picked.length));
    $$('.est-row',list).forEach(r=>r.classList.toggle('sel',est[r.dataset.c]>=0));
    if(g&&!RM){const o={v:shown};g.killTweensOf(total);g.to(o,{v:tot,duration:.686,ease:'power3.out',onUpdate:()=>{total.textContent=vnd(Math.round(o.v/1000)*1000)}});
      g.fromTo(total,{scale:1.062},{scale:1,duration:.424,ease:'power3.out',transformOrigin:'0 50%'})}else total.textContent=vnd(tot);
    shown=tot;
    if(goBtn)goBtn.dataset.summary=picked.length?picked.map(x=>`${x.c.name} (${x.t.n})`).join(', ')+` — tổng dự kiến ${vnd(tot)}`+(disc?' (đã giảm combo 10%)':''):'';
  };
  const choose=(c,i)=>{est[c]=i;const s=$(`.seg[data-c="${c}"]`,list);if(s)$$('button',s).forEach(x=>{const on=+x.dataset.i===i;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))})};
  list.addEventListener('click',e=>{const b=e.target.closest('.seg button');if(!b)return;choose(b.parentElement.dataset.c,+b.dataset.i);render()});
  [['web',1],['motion',0]].forEach(([c,i])=>{if(CATS.find(x=>x.id===c))choose(c,i)});render();
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
  sel.addEventListener('change',()=>pickBanner(sel.value&&sel.value!=='combo'?sel.value:sel.value==='combo'?'Cấu hình tự tính':'',false));
  $('#cfPickX').addEventListener('click',()=>{sel.value='';pickBanner('')});
  [name,phone].forEach(i=>i.addEventListener('input',()=>{i.closest('.field').classList.remove('bad');m.textContent=''}));
  cf.addEventListener('submit',e=>{e.preventDefault();
    const n=name.value.trim(),ph=phone.value.trim();
    name.closest('.field').classList.toggle('bad',!n);phone.closest('.field').classList.toggle('bad',!ph);
    if(!n||!ph){m.textContent='Vui lòng nhập họ tên và số điện thoại để chúng tôi liên hệ lại.';(n?phone:name).focus();return}
    /* form chưa gửi đi đâu: soạn sẵn nội dung để khách chép và dán qua Zalo */
    const svc=sel.value==='combo'?'Cấu hình tự tính':sel.value,pr=priceOf(svc),bud=$('#f-budget'),raw=$('#f-msg').value.split('\n').map(l=>l.trim()).filter(Boolean);
    const RE=/^Mẫu tham khảo:\s*/,smp=raw.filter(l=>RE.test(l)).map(l=>l.replace(RE,'')),rest=raw.filter(l=>!RE.test(l)),req=$('#cfReq');
    if(req)req.textContent=['YÊU CẦU TƯ VẤN · DREAMLAB','Họ tên: '+n,'SĐT / Zalo: '+ph,'Gói quan tâm: '+(svc?svc+(pr?' ('+pr+')':''):'Chưa chọn, cần tư vấn'),bud?'Ngân sách: '+bud.value:'',smp.length?'Mẫu tham khảo: '+smp.join('; '):'','Mô tả: '+(rest.join(' / ')||'(chưa ghi)')].filter(Boolean).join('\n');
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
  g.fromTo('#giant',{xPercent:0},{xPercent:-38.2,ease:'none',scrollTrigger:{trigger:ft,start:'top bottom',end:'bottom bottom',scrub:true}});
  g.fromTo('#footSpiral',{strokeDashoffset:1},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:ft,start:'top 90%',end:'bottom bottom',scrub:true}});
});

D.refresh();
});
})();
