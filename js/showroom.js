/* Dream Labs — Showroom trang chủ: mỗi hạng mục một hàng, băng chuyền vuốt ngang gồm mọi mẫu (ảnh, tên, ngành, giá gói gợi ý).
   Nạp SAU js/samples.js. Dữ liệu: DL_DATA.CATS (giá) + DL_SAMPLES[cat] (mẫu, trường pkg = "<Tên hạng mục> — <Tên gói>").
   Bấm thẻ → DL.samples (thuộc tính data-sm-open / data-sm-id) mở chi tiết mẫu trong Phòng mẫu.
   Điện thoại: vuốt + scroll-snap, hé thẻ kế tiếp, thanh tiến độ. Máy tính: kéo chuột, nút ‹ ›, phím mũi tên khi focus. Chuyển động chỉ dùng transform/opacity. */
(()=>{
const D=window.DL;if(!D)return;
D.ready(()=>{
const box=document.getElementById('showRows');if(!box)return;
const CATS=((window.DL_DATA||{}).CATS||[]),S=window.DL_SAMPLES||{},RM=D.RM;
const T=D.t||(s=>s),VI=!D.lang||D.lang==='vi',FX=p=>{const f=D.fx?D.fx(p):'';return f?'<small class="fx">'+f+'</small>':''};
const ORDER=['ai','web','landing','product','motion','video'];
const SHORT={ai:T('Tự động hóa AI'),web:T('Website'),landing:T('Landing Page'),product:T('Thiết kế sản phẩm'),motion:T('Motion Graphic'),video:T('Edit Video')};
const PAGE={ai:'tu-dong-hoa-quy-trinh-doanh-nghiep/',web:'thiet-ke-website/',landing:'thiet-ke-landing-page/',product:'thiet-ke-bao-bi/',motion:'video-motion-graphic/',video:'edit-video/'};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nk=s=>String(s||'').normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const pad=n=>String(n).padStart(2,'0');
const vnd=D.vnd;
const AR='<svg viewBox="0 0 16 16" aria-hidden="true"><use href="#dl-arrow"/></svg>';
const CH=d=>`<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${d<0?'M10 3.5L5.5 8l4.5 4.5':'M6 3.5L10.5 8 6 12.5'}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const tierOf=(pkg,c)=>{const k=nk(pkg);return c.tiers.find(t=>nk(c.name+' '+t.n)===k)||c.tiers.find(t=>t.hot)||c.tiers[0]};
const badge=r=>T(r.spin?'Xoay 360':r.kind==='video'?'Phim':r.kind==='interactive'?'Bấm thử':r.kind==='site'&&r.demo?'Chạy thật':'');

const rows=ORDER.map(id=>CATS.find(c=>c.id===id)).filter(Boolean).map(c=>({c,items:(Array.isArray(S[c.id])?S[c.id]:[]).filter(r=>r&&r.id)})).filter(r=>r.items.length);
if(!rows.length)return;
const total=rows.reduce((a,r)=>a+r.items.length,0);
const hc=document.getElementById('heroCount');if(hc)hc.textContent=T('{n} mẫu · {m} dịch vụ',{n:total,m:rows.length});

box.innerHTML=rows.map(({c,items},ri)=>{
  const min=c.tiers.reduce((a,t)=>t.p<a.p?t:a,c.tiers[0]),sh=SHORT[c.id]||c.name;
  return `<div class="srow" id="${VI?'p-':'sr-'}${c.id}" data-cat="${c.id}">
  <div class="wrap srow-h">
    <div class="srow-t"><span class="srow-n">${pad(ri+1)}</span><h3>${esc(sh)}</h3><span class="srow-c">${T('{n} mẫu',{n:items.length})}</span></div>
    <p class="srow-from">${T('Từ')} <b>${vnd(min.p)}</b>${min.u?`<small>${esc(min.u)}</small>`:''}${FX(min.p)}</p>
    <a class="btn sm srow-go" href="${VI?PAGE[c.id]||'bang-gia/':'#p-'+c.id}">${T('Xem bảng giá')} ${AR}</a>
    <div class="srow-nav"><button class="sn" type="button" data-d="-1" aria-label="${esc(T('Mẫu {c} trước',{c:sh}))}">${CH(-1)}</button><button class="sn" type="button" data-d="1" aria-label="${esc(T('Mẫu {c} tiếp theo',{c:sh}))}">${CH(1)}</button></div>
  </div>
  <div class="srail" tabindex="0" role="region" aria-label="${esc(T('Mẫu {c}: vuốt ngang hoặc dùng phím mũi tên',{c:sh}))}">
    <ul class="strack">${items.map((r,i)=>{const t=tierOf(r.pkg,c),b=badge(r),price=vnd(t.p)+(t.u||''),pfx=D.fx?D.fx(t.p):'';
      return `<li class="sc" style="--i:${Math.min(i,5)}"><button class="sc-b" type="button" data-sm-open="${c.id}" data-sm-id="${esc(r.id)}" data-cursor="Xem" aria-label="${esc(T('{t}, {i}: {c} gói {n}, {p}. Xem chi tiết',{t:r.title,i:r.industry||'',c:sh,n:t.n,p:price+(pfx?' ('+pfx+')':'')}))}">
        <span class="sc-img"><span class="sc-par"><img src="${esc(r.cover||'')}" width="1280" height="791" alt="" loading="${ri<2&&i<3?'eager':'lazy'}" decoding="async" draggable="false"></span>${b?`<span class="sc-tag${r.spin?' s360':''}">${b}</span>`:''}<span class="sc-view" aria-hidden="true">${T('Xem chi tiết')} ${AR}</span></span>
        <span class="sc-cap"><span class="sc-i">${esc(r.industry&&r.industry!=='Khác'&&r.industry!==T('Khác')?r.industry:'Concept')}</span><span class="sc-t">${esc(r.title)}</span>
        <span class="sc-p"><span>${esc(sh)} · ${esc(t.n)}</span><b>${price}${FX(t.p)}</b></span></span></button></li>`}).join('')}</ul>
  </div>
  <div class="wrap srow-f" aria-hidden="true"><div class="sbar"><i></i></div><span class="scount"><b>01</b> / ${pad(items.length)}</span></div>
</div>`}).join('');
document.querySelectorAll('.sc-img img').forEach(im=>{const bad=()=>im.closest('.sc-img').classList.add('err');im.addEventListener('error',bad);if(im.complete&&!im.naturalWidth)bad()});

/* chặn click sau khi kéo chuột (đặt ở window, chạy trước bộ bắt click của phòng mẫu ở document) */
let swallow=false;
addEventListener('click',e=>{if(swallow){swallow=false;e.preventDefault();e.stopImmediatePropagation()}},true);

const rowsEl=[...box.querySelectorAll('.srow')];
rowsEl.forEach(row=>{
  const rail=row.querySelector('.srail'),track=row.querySelector('.strack'),cards=[...track.children],pars=cards.map(c=>c.querySelector('.sc-par'));
  const bar=row.querySelector('.sbar i'),cnt=row.querySelector('.scount b'),[prev,next]=row.querySelectorAll('.sn');
  let lefts=[],ws=[],padL=0,max=0,raf=0,lastI=-1;
  const measure=()=>{padL=parseFloat(getComputedStyle(track).paddingLeft)||0;lefts=cards.map(c=>c.offsetLeft);ws=cards.map(c=>c.offsetWidth);max=rail.scrollWidth-rail.clientWidth;
    const f=Math.min(1,rail.clientWidth/rail.scrollWidth);bar.style.width=(f*100)+'%';row.classList.toggle('fits',max<=2);paint()};
  const idx=()=>{const x=rail.scrollLeft+padL;let b=0,d=1e9;lefts.forEach((l,i)=>{const k=Math.abs(l-x);if(k<d){d=k;b=i}});return b};
  function paint(){raf=0;const x=rail.scrollLeft,p=max>0?x/max:0,bw=bar.parentElement.clientWidth;
    bar.style.transform=`translate3d(${(p*(bw-bar.offsetWidth)).toFixed(1)}px,0,0)`;
    const i=x>=max-2?cards.length-1:idx();if(i!==lastI){lastI=i;cnt.textContent=pad(i+1)}
    prev.disabled=x<=2;next.disabled=x>=max-2;
    if(!RM){const cw=rail.clientWidth;for(let k=0;k<cards.length;k++){const c=lefts[k]+ws[k]/2-x;if(c<-ws[k]||c>cw+ws[k])continue;const o=(c-cw/2)/cw;pars[k].style.transform=`translate3d(${(-o*7).toFixed(2)}%,0,0)`}}}
  const req=()=>{if(!raf)raf=requestAnimationFrame(paint)};
  const go=i=>{i=Math.max(0,Math.min(cards.length-1,i));rail.scrollTo({left:Math.min(max,lefts[i]-padL),behavior:RM?'auto':'smooth'});return i};
  const per=()=>Math.max(1,Math.floor((rail.clientWidth-padL)/((ws[0]||1)+16)));
  rail.addEventListener('scroll',req,{passive:true});
  row.querySelector('.srow-nav').addEventListener('click',e=>{const b=e.target.closest('.sn');if(!b)return;const d=+b.dataset.d;go(idx()+d*per())});
  rail.addEventListener('keydown',e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight'&&e.key!=='Home'&&e.key!=='End')return;e.preventDefault();
    const cur=cards.indexOf(document.activeElement&&document.activeElement.closest('.sc'));
    const base=cur>=0?cur:idx(),i=e.key==='Home'?0:e.key==='End'?cards.length-1:base+(e.key==='ArrowRight'?1:-1),t=go(i);
    if(cur>=0)cards[t].querySelector('.sc-b').focus({preventScroll:true})});
  /* kéo bằng chuột (máy tính) */
  let drag=null;
  rail.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button)return;drag={x:e.clientX,sl:rail.scrollLeft,moved:false,v:0,t:performance.now(),lx:e.clientX}});
  rail.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;
    if(!drag.moved&&Math.abs(dx)>6){drag.moved=true;rail.classList.add('drag');try{rail.setPointerCapture(e.pointerId)}catch(_){}}
    if(drag.moved){const n=performance.now();drag.v=(e.clientX-drag.lx)/Math.max(1,n-drag.t);drag.t=n;drag.lx=e.clientX;rail.scrollLeft=drag.sl-dx}});
  const end=e=>{if(!drag)return;const d=drag;drag=null;if(!d.moved)return;swallow=true;setTimeout(()=>{swallow=false},0);
    rail.classList.remove('drag');const fling=-d.v*260,x=rail.scrollLeft+fling+padL;let b=0,m=1e9;lefts.forEach((l,i)=>{const k=Math.abs(l-x);if(k<m){m=k;b=i}});go(b)};
  rail.addEventListener('pointerup',end);rail.addEventListener('pointercancel',end);
  rail.addEventListener('dragstart',e=>e.preventDefault());
  new ResizeObserver(measure).observe(rail);measure();
});
/* thẻ hiện dần khi hàng vào màn hình */
if(!RM&&'IntersectionObserver' in window){box.classList.add('reveal');const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -12% 0px'});rowsEl.forEach(r=>io.observe(r))}
D.refresh&&D.refresh();
});
})();
