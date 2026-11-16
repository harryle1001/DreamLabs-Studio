/* Dream Labs — "Phòng mẫu" (Atelier). Session F (v3). Nạp SAU mọi js/samples-<cat>.js.
   Dữ liệu: window.DL_SAMPLES[cat] = [item…] (hợp đồng trong BRIEF.md, phần v3). Thiếu trường, ảnh lỗi, hạng mục rỗng đều chịu được.
   Lối vào: mọi phần tử [data-sm-open="<cat>"] (để trống = hạng mục đầu tiên có mẫu), tùy chọn data-sm-id="<id mẫu>".
            core.js chừa sẵn .sm-slot[data-sm-slot="<cat>"] dưới mỗi hạng mục giá; 70-pricing.html có dải #phong-mau.
   API: DL.samples.open(cat?, id?) → true nếu mở được · DL.samples.close() · DL.samples.count(cat?) · DL.samples.items(cat)
   "Chọn mẫu này": <a data-pick="<gói>" data-pick-note="Mẫu tham khảo: <tên> (<hạng mục>)"> — core.js điền form rồi phát 'dl:pick', phòng mẫu tự đóng. */
(()=>{
const D=window.DL;if(!D)return;
const S=window.DL_SAMPLES=window.DL_SAMPLES||{};
const g=D.gsap,RM=D.RM,PHI=D.PHI;
const CATS=((window.DL_DATA||{}).CATS||[]).filter(c=>c&&c.id);
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const str=v=>typeof v==='string'?v.trim():'';
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
const pad=n=>String(n).padStart(2,'0');
const ARROW='<svg class="sm-ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SPIRAL='M15 10A1 1 0 0 0 16 9A1 1 0 0 0 15 8A2 2 0 0 0 13 10A3 3 0 0 0 16 13A5 5 0 0 0 21 8A8 8 0 0 0 13 0A13 13 0 0 0 0 13A21 21 0 0 0 21 34A34 34 0 0 0 55 0';
const GOLD_GRID='M13 10h3v3h-3zM16 8h5v5h-5zM13 0h8v8h-8zM0 0h13v13h-13zM0 13h21v21h-21zM21 0h34v34h-34z';
const IND=['Nước hoa','Túi xách','Giày','Đồng hồ','Trang sức','Du thuyền','Phi cơ riêng','Bất động sản','Siêu xe','Rượu & ẩm thực','Thời trang','Nghỉ dưỡng','Khác'];
const LINE={web:['Website cho thương hiệu','xa xỉ.'],landing:['Landing page','mở bán riêng tư.'],video:['Edit video','chuẩn điện ảnh.'],product:['Bao bì và sản phẩm','đáng sưu tầm.'],motion:['Motion graphic','có nhịp thở.'],ai:['AI phục vụ như','quản gia riêng.']};
const KIND_LABEL={site:'Website chạy thật',product:'Bộ mẫu mã',video:'Phim',interactive:'Demo tương tác',image:'Hình mẫu'};
const RATIO={'16:9':[16,9],'9:16':[9,16],'1:1':[1,1]};
const dur=s=>{s=Math.max(0,Math.round(+s||0));return Math.floor(s/60)+':'+pad(s%60)};
const url=p=>{try{return new URL(p,document.baseURI).href}catch(e){return p}};

/* ───────── dữ liệu: chuẩn hóa, không sửa item gốc ───────── */
const nk=s=>String(s||'').normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
function tierOf(pkg,catId){
  const k=nk(pkg);let hit=null;
  if(k)for(const c of CATS)for(const t of c.tiers||[])if(nk(c.name+' '+t.n)===k)hit={c,t};
  if(!hit){const c=CATS.find(x=>x.id===catId);if(c&&c.tiers&&c.tiers.length)hit={c,t:c.tiers.find(t=>t.hot)||c.tiers[0]}}
  if(!hit)return null;
  return{...hit,label:hit.c.name+' — '+hit.t.n,price:D.vnd(hit.t.p),unit:(hit.t.u||'')+(hit.t.plus?' trở lên':'')};
}
function norm(r,cat,i){
  const vars=(Array.isArray(r.variants)?r.variants:[]).filter(v=>v&&str(v.img)).map((v,j)=>({name:str(v.name)||'Mẫu '+pad(j+1),swatch:str(v.swatch),img:str(v.img)}));
  const gal=(Array.isArray(r.gallery)?r.gallery:[]).map(str).filter(Boolean);
  let kind=str(r.kind);
  const ok={site:!!(str(r.demo)||str(r.long)||str(r.longM)),product:!!(vars.length||gal.length),video:!!str(r.src),interactive:typeof r.mount==='function'};
  if(!ok[kind])kind=ok.interactive?'interactive':ok.video?'video':ok.product?'product':ok.site?'site':'image';
  if(kind==='product'&&!vars.length)gal.forEach((s,j)=>vars.push({name:'Ảnh '+pad(j+1),swatch:'',img:s})),gal.length=0;
  return{raw:r,cat,i,kind,vars,gal,id:str(r.id)||cat+'-'+(i+1),title:str(r.title)||'Mẫu chưa đặt tên',industry:str(r.industry)||'Khác',desc:str(r.desc),
    tags:(Array.isArray(r.tags)?r.tags:[]).map(str).filter(Boolean).slice(0,3),cover:str(r.cover)||str(r.poster)||(vars[0]?vars[0].img:''),tier:tierOf(str(r.pkg),cat)};
}
const cache={};
const items=cat=>cache[cat]||(cache[cat]=(Array.isArray(S[cat])?S[cat]:[]).filter(x=>x&&typeof x==='object').map((r,i)=>{try{return norm(r,cat,i)}catch(e){console.warn('[samples] bỏ qua mẫu lỗi',cat,i,e);return null}}).filter(Boolean));
const liveCats=()=>CATS.filter(c=>items(c.id).length);
const total=()=>CATS.reduce((a,c)=>a+items(c.id).length,0);
const catOf=id=>CATS.find(c=>c.id===id);
const kindBadge=it=>{const r=it.raw;
  if(it.kind==='site')return str(r.demo)?'<i class="sm-dot"></i>Chạy thật':'Ảnh toàn trang';
  if(it.kind==='product')return it.vars.length+' mẫu mã';
  if(it.kind==='video')return'<i class="sm-tri"></i>'+(+r.duration?dur(r.duration):'Phim')+(RATIO[str(r.ratio)]?' · '+str(r.ratio):'');
  if(it.kind==='interactive')return'<i class="sm-dot"></i>Tự tay thử';
  return''};
const mono=t=>{const w=t.replace(/[^\p{L}\p{N} ]+/gu,' ').trim().split(/\s+/);return esc(((w[0]||'')[0]||'')+(w.length>1?(w[w.length-1][0]||''):'')).toUpperCase()};
const coverHTML=(it,eager)=>(it.cover?`<img src="${esc(it.cover)}" width="1280" height="791" alt="" ${eager?'':'loading="lazy" '}decoding="async">`:'')+`<span class="sm-mono" aria-hidden="true">${mono(it.title)}</span>`;

/* ───────── trạng thái ───────── */
let dlg=null,shell,catsNav,crumb,gridV,detailV,heroBox,filterBox,grid,zoomBox,ctaBar;
let cat='',filter='all',list=[],cur=null,stage=null,closing=false,gridTop=0,wired=false,escAt=0,cleaned=true,closeId=0;

/* ───────── dựng khung một lần ───────── */
function build(){
  if(dlg)return;
  dlg=el('dialog','sm-room');dlg.setAttribute('aria-label','Phòng mẫu Dream Labs');
  dlg.innerHTML=`<div class="sm-shell">
    <header class="sm-top">
      <div class="sm-brand"><svg viewBox="0 0 26 26" aria-hidden="true"><use href="#dl-logo"/></svg><span>Phòng mẫu</span><i>Atelier</i></div>
      <nav class="sm-cats" aria-label="Hạng mục mẫu"></nav>
      <div class="sm-crumb">
        <button class="sm-back" type="button" data-sm-back><svg class="sm-ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span></button>
        <span class="sm-count" aria-live="polite"></span>
        <span class="sm-pn"><button class="sm-ib" type="button" data-sm-go="-1" aria-label="Mẫu trước"><svg class="sm-ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5L5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="sm-ib" type="button" data-sm-go="1" aria-label="Mẫu tiếp theo"><svg class="sm-ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button></span>
      </div>
      <button class="sm-ib sm-x" type="button" data-sm-close aria-label="Đóng phòng mẫu"><svg class="sm-ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
    </header>
    <div class="sm-area">
      <div class="sm-view sm-gridv" data-lenis-prevent tabindex="-1"><div class="sm-wrap">
        <div class="sm-hero"></div>
        <div class="sm-filter" role="group" aria-label="Lọc theo ngành hàng"></div>
        <div class="sm-grid"></div>
        <div class="sm-foot"><svg class="sm-bg" viewBox="-1 -1 57 36" aria-hidden="true"><path class="g" d="${GOLD_GRID}"/><path class="s" d="${SPIRAL}"/></svg><p>Mọi mẫu trong phòng là <b>concept do Dream Labs tự thiết kế</b>, thương hiệu tự nghĩ, để bạn hình dung chất lượng trước khi đặt làm. Chọn một mẫu, chúng tôi may đo lại cho thương hiệu của bạn.</p>
          <a class="btn" href="#lien-he">Chưa thấy mẫu ưng ý? Nhận tư vấn riêng ${ARROW}</a></div>
      </div></div>
      <div class="sm-view sm-detail" data-lenis-prevent tabindex="-1"></div>
    </div>
    <div class="sm-cta" hidden></div>
    <div class="sm-zoom" hidden><img alt=""><button class="sm-ib" type="button" aria-label="Thu nhỏ ảnh"><svg class="sm-ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button></div>
  </div>`;
  document.body.append(dlg);
  shell=$('.sm-shell',dlg);catsNav=$('.sm-cats',dlg);crumb=$('.sm-crumb',dlg);gridV=$('.sm-gridv',dlg);detailV=$('.sm-detail',dlg);
  heroBox=$('.sm-hero',dlg);filterBox=$('.sm-filter',dlg);grid=$('.sm-grid',dlg);zoomBox=$('.sm-zoom',dlg);ctaBar=$('.sm-cta',dlg);
  catsNav.innerHTML=CATS.map(c=>{const n=items(c.id).length;return`<button class="sm-cat" type="button" data-c="${c.id}" aria-pressed="false"${n?'':' disabled'}>${esc(c.name)}<sup>${n?pad(n):'—'}</sup></button>`}).join('');
  /* ảnh: hiện dần khi tải xong; lỗi thì ẩn ảnh, giữ nền gradient + chữ lồng */
  dlg.addEventListener('error',e=>{const im=e.target;if(im&&im.tagName==='IMG'){im.classList.add('sm-err');const b=im.closest('[data-imgbox]');b&&b.classList.add('is-noimg')}},true);
  dlg.addEventListener('click',onClick);
  dlg.addEventListener('keydown',onKey);
  dlg.addEventListener('cancel',e=>{e.preventDefault();if(performance.now()-escAt>424)stepBack()});
  dlg.addEventListener('close',()=>{if(!dlg.open)onClosed()}); // sự kiện close đến trễ một nhịp: nếu phòng đã được mở lại thì bỏ qua
  zoomBox.addEventListener('click',()=>zoom(null));
}

/* ───────── lưới ───────── */
/* bố cục vàng trên lưới 24 cột: hàng đôi 15/9 (≈61.8/38.2) xen hàng ba 8/8/8, đảo chiều mỗi chu kỳ 5 thẻ (Fibonacci 2+3) */
function spans(n){const out=[];let flip=false,left=n;
  while(left>0){
    if(left===1){out.push(flip?'maj r':'maj');break}
    out.push(flip?'min':'maj',flip?'maj':'min');left-=2;
    if(left>=3){out.push('thr','thr','thr');left-=3}
    else if(left===2){out.push(flip?'maj':'min',flip?'min':'maj');left=0}
    else if(left===1){out.push(flip?'maj':'maj r');left=0}
    flip=!flip}
  return out}
function renderHero(){
  const c=catOf(cat),n=items(cat).length,ln=LINE[cat]||[c.name,'tuyển chọn.'],from=c.tiers&&c.tiers[0];
  heroBox.innerHTML=`<div class="sm-hero-t"><p class="eyebrow">Phòng mẫu · ${pad(CATS.indexOf(c)+1)} / ${pad(CATS.length)}</p>
    <h2><span class="sm-l"><span>${esc(ln[0])}</span></span> <span class="sm-l"><span><em>${esc(ln[1])}</em></span></span></h2></div>
   <div class="sm-hero-s"><p class="lead">${n} mẫu concept cho hàng xa xỉ: mỗi mẫu một thế giới riêng. Bấm vào mẫu để xem kỹ, thử trực tiếp và chọn làm điểm khởi đầu cho thương hiệu của bạn.</p>
    <dl class="sm-hero-m"><div><dt>Số mẫu</dt><dd>${pad(n)}</dd></div>${from?`<div><dt>Giá ${esc(c.name)} từ</dt><dd>${D.vnd(from.p)}${from.u?`<small>${esc(from.u)}</small>`:''}</dd></div>`:''}</dl></div>`;
}
function renderFilter(){
  const all=items(cat),m=new Map();all.forEach(it=>m.set(it.industry,(m.get(it.industry)||0)+1));
  const keys=[...m.keys()].sort((a,b)=>{const x=IND.indexOf(a),y=IND.indexOf(b);return(x<0?99:x)-(y<0?99:y)});
  filterBox.hidden=keys.length<2;
  filterBox.innerHTML=[['all','Tất cả',all.length],...keys.map(k=>[k,k,m.get(k)])].map(([k,l,n])=>`<button class="sm-chip" type="button" data-f="${esc(k)}" aria-pressed="${k===filter}">${esc(l)}<small>${n}</small></button>`).join('');
}
function renderGrid(anim){
  const all=items(cat);list=filter==='all'?all:all.filter(it=>it.industry===filter);
  const sp=spans(list.length);
  grid.innerHTML=list.map((it,i)=>{const b=kindBadge(it);return`<article class="sm-card ${sp[i]||'thr'}">
    <button class="sm-card-b" type="button" data-id="${esc(it.id)}" data-cursor="Xem mẫu" aria-label="Xem mẫu ${esc(it.title)}, ${esc(it.industry)}">
     <span class="sm-cover" data-imgbox style="--a:${((it.i*137.5)%360).toFixed(1)}deg">${coverHTML(it,i<2)}
      <span class="sm-no">N° ${pad(it.i+1)}</span><span class="tag-concept">Concept</span>${b?`<span class="sm-kind">${b}</span>`:''}</span>
     <span class="sm-cap"><span class="sm-ind">${esc(it.industry)}</span><span class="sm-title">${esc(it.title)}${ARROW}</span>
      ${it.desc?`<span class="sm-desc">${esc(it.desc)}</span>`:''}${it.tags.length?`<span class="chips">${it.tags.map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</span>`:''}</span>
    </button></article>`}).join('')||'<p class="sm-empty">Chưa có mẫu trong nhóm này.</p>';
  $$('.sm-cover img',grid).forEach(im=>{if(im.complete&&!im.naturalWidth)im.dispatchEvent(new Event('error'))});
  if(anim&&g&&!RM)g.fromTo($$('.sm-card',grid),{y:42,opacity:0},{y:0,opacity:1,duration:.686,ease:'expo.out',stagger:.062,clearProps:'transform,opacity'});
}
function setCat(c,anim){
  if(!items(c).length)return;
  cat=c;filter='all';
  $$('.sm-cat',catsNav).forEach(b=>{const on=b.dataset.c===c;b.setAttribute('aria-pressed',String(on));
    if(on&&catsNav.scrollWidth>catsNav.clientWidth)catsNav.scrollTo({left:b.offsetLeft-(catsNav.clientWidth-b.offsetWidth)/2,behavior:RM||!anim?'auto':'smooth'})});
  renderHero();renderFilter();renderGrid(anim);gridV.scrollTop=0;
  if(anim&&g&&!RM){g.fromTo($$('.sm-l>span',heroBox),{yPercent:110},{yPercent:0,duration:.686,ease:'expo.out',stagger:.1,clearProps:'transform'});
    g.fromTo([$('.eyebrow',heroBox),$('.sm-hero-s',heroBox),filterBox],{y:16,opacity:0},{y:0,opacity:1,duration:.686,ease:'expo.out',stagger:.062,delay:.1,clearProps:'transform,opacity'})}
}
function setFilter(f){
  if(f===filter)return;filter=f;
  $$('.sm-chip',filterBox).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.f===f)));
  if(g&&!RM)g.to($$('.sm-card',grid),{opacity:0,y:-10,duration:.162,ease:'power2.in',overwrite:true,onComplete:()=>renderGrid(true)});else renderGrid(false);
}

/* ───────── khung sân khấu theo kind ───────── */
function zoom(src,alt){
  const im=$('img',zoomBox);
  if(!src){if(zoomBox.hidden)return;zoomBox.hidden=true;im.removeAttribute('src');return}
  im.src=src;im.alt=alt||'';zoomBox.hidden=false;
  if(g&&!RM)g.fromTo(zoomBox,{opacity:0},{opacity:1,duration:.262,ease:'power2.out',clearProps:'opacity'});
  $('button',zoomBox).focus({preventScroll:true});
}
function segHTML(label,opts,attr){return`<div class="sm-seg" role="group" aria-label="${label}">${opts.map(([v,t])=>`<button type="button" data-${attr}="${v}" aria-pressed="false">${t}</button>`).join('')}</div>`}
function segSet(root,attr,val){$$(`[data-${attr}]`,root).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[attr]===val)))}

/* site: ảnh cuộn dài (Máy tính / Điện thoại) + demo trực tiếp trong iframe, không tải được thì trả về ảnh cuộn dài */
function stageSite(it){
  const r=it.raw,demo=str(r.demo),L={d:str(r.long),m:str(r.longM)};
  let mode=innerWidth<=860&&L.m?'m':L.d?'d':L.m?'m':'d',live=false,ok=false,timer=0,ro=null,ifr=null;
  const node=el('div','sm-site',`<div class="sm-site-bar"><span class="sm-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="sm-url">${esc(demo||'Ảnh chụp toàn trang')}</span>${demo?`<a class="sm-lk" href="${esc(demo)}">Mở trang demo riêng</a>`:''}${segHTML('Khung xem',[['d','Máy tính'],['m','Điện thoại']],'m')}${demo?`<button class="btn primary sm" type="button" data-live>Mở demo trực tiếp ${ARROW}</button>`:''}</div>
   <div class="sm-port"><div class="sm-frame" data-imgbox><div class="sm-shot" tabindex="0" role="group" aria-label="Ảnh chụp toàn trang ${esc(it.title)}, cuộn để xem"><img alt="Ảnh chụp toàn trang ${esc(it.title)}" decoding="async"><span class="sm-mono" aria-hidden="true">${mono(it.title)}</span></div><div class="sm-load" aria-hidden="true">Đang tải demo…</div></div></div>
   <p class="sm-note" hidden></p>`);
  const port=$('.sm-port',node),frame=$('.sm-frame',node),shot=$('.sm-shot',node),img=$('img',shot),note=$('.sm-note',node),liveBtn=$('[data-live]',node);
  const shotSrc=()=>(mode==='m'?L.m||L.d:L.d||L.m)||it.cover;
  img.addEventListener('error',()=>{if(it.cover&&img.getAttribute('src')!==it.cover){img.classList.remove('sm-err');frame.classList.remove('is-noimg');img.src=it.cover}});
  const fit=()=>{const cw=port.clientWidth;if(!cw)return;const m=mode==='m',vh=Math.max(377,innerHeight*.68);
    const w=m?Math.min(390,cw):cw,h=Math.round(m?Math.min(754,vh):Math.min(vh,Math.max(377,w/PHI)));
    frame.classList.toggle('is-m',m);frame.style.width=w+'px';frame.style.height=h+'px';
    if(ifr){const iw=m?390:w>=1180?w:1440,k=w/iw;ifr.style.width=iw+'px';ifr.style.height=Math.ceil(h/k)+'px';ifr.style.transform=k===1?'none':`scale(${k})`}};
  const paint=()=>{segSet(node,'m',mode);const s=shotSrc();frame.classList.remove('is-noimg');img.classList.remove('sm-err');
    if(s){if(img.getAttribute('src')!==s)img.src=s}else{img.removeAttribute('src');frame.classList.add('is-noimg')}
    shot.scrollTop=0;fit()};
  const setOk=()=>{if(ok||!live)return;ok=true;clearTimeout(timer);frame.classList.add('is-ok')};
  const onMsg=e=>{if(ifr&&e.source===ifr.contentWindow)setOk()};
  const stopLive=()=>{if(!live)return;live=false;ok=false;clearTimeout(timer);removeEventListener('message',onMsg);
    if(ifr){try{ifr.src='about:blank'}catch(e){}ifr.remove();ifr=null}
    frame.classList.remove('is-live','is-ok');if(liveBtn)liveBtn.innerHTML='Mở demo trực tiếp '+ARROW};
  const fail=()=>{if(ok||!live)return;stopLive();note.hidden=false;
    note.textContent='Khung xem trực tiếp không tải được ở môi trường này nên đang hiện ảnh chụp toàn trang. Bạn vẫn mở được trang demo bằng liên kết "Mở trang demo riêng".';paint()};
  const startLive=()=>{if(live||!demo)return;live=true;ok=false;note.hidden=true;frame.classList.add('is-live');
    ifr=document.createElement('iframe');ifr.title='Demo '+it.title;ifr.setAttribute('loading','eager');
    ifr.addEventListener('load',()=>{try{const d=ifr.contentDocument;if(d&&d.contentType==='text/html'&&d.location.href!=='about:blank'&&d.querySelector('main,header,nav,section,article,footer,canvas'))setOk()}catch(e){}});
    ifr.addEventListener('error',fail);addEventListener('message',onMsg);
    frame.append(ifr);fit();ifr.src=url(demo);timer=setTimeout(fail,4240);
    liveBtn.textContent='Về ảnh chụp';
    const v=node.closest('.sm-view');if(v){const y=node.getBoundingClientRect().top-v.getBoundingClientRect().top;if(y>26)v.scrollBy({top:y-16,behavior:RM?'auto':'smooth'})}};
  node.addEventListener('click',e=>{const b=e.target.closest('[data-m]');
    if(b){mode=b.dataset.m;paint();return}
    if(e.target.closest('[data-live]'))live?(stopLive(),paint()):startLive()});
  return{node,wide:true,start(){paint();if(window.ResizeObserver){ro=new ResizeObserver(fit);ro.observe(port)}},destroy(){stopLive();ro&&ro.disconnect()}};
}

/* product: ảnh lớn đổi mẫu mã có crossfade + dải ảnh bấm xem lớn */
function stageProduct(it){
  const all=[...it.vars.map((v,i)=>({src:v.img,cap:v.name,vi:i})),...it.gal.map((s,i)=>({src:s,cap:'Ảnh bộ sưu tập '+pad(i+1),vi:-1}))];
  let at=0,tok=0;
  const node=el('div','sm-prod',`<div class="sm-pstage" data-imgbox style="--a:${((it.i*137.5)%360).toFixed(1)}deg"><span class="sm-mono" aria-hidden="true">${mono(it.title)}</span><img class="sm-pi" alt="" decoding="async"><img class="sm-pi" alt="" decoding="async">
     <span class="sm-pcap" aria-live="polite"></span><button class="sm-ib sm-zoomb" type="button" data-zoom aria-label="Phóng to ảnh" data-cursor="Phóng to"><svg class="sm-ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M9.5 2.5h4v4M13.5 2.5L9 7M6.5 13.5h-4v-4M2.5 13.5L7 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
   ${all.length>1?`<div class="sm-gal" role="group" aria-label="Ảnh của mẫu này">${all.map((a,i)=>`<button class="sm-th" type="button" data-at="${i}" data-imgbox aria-pressed="false" aria-label="${esc(a.cap)}"><img src="${esc(a.src)}" alt="" loading="lazy" decoding="async"></button>`).join('')}</div>`:''}`);
  const box=$('.sm-pstage',node),layers=$$('.sm-pi',node),cap=$('.sm-pcap',node);
  const picker=it.vars.length>1?el('div','sm-var',`<p class="sm-var-l">Mẫu mã <b></b><small>${pad(it.vars.length)} lựa chọn</small></p><div class="sm-sws" role="group" aria-label="Chọn mẫu mã">${it.vars.map((v,i)=>`<button class="sm-sw" type="button" data-v="${i}" aria-pressed="false"><i${v.swatch?` style="background:${esc(v.swatch)}"`:''}></i><span>${esc(v.name)}</span></button>`).join('')}</div>`):null;
  const show=i=>{const a=all[i];if(!a)return;at=i;const t=++tok;
    $$('.sm-th',node).forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.at===i)));
    if(picker){$$('.sm-sw',picker).forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.v===a.vi)));if(a.vi>=0)$('.sm-var-l b',picker).textContent=a.cap}
    cap.textContent=a.cap;
    const on=layers.find(l=>l.classList.contains('is-on')),nx=layers.find(l=>l!==on);
    const done=bad=>{if(t!==tok)return;nx.onload=nx.onerror=null;box.classList.toggle('is-noimg',!!bad);nx.classList.toggle('sm-err',!!bad);nx.alt=it.title+', '+a.cap;
      if(!bad&&nx.naturalWidth)box.style.setProperty('--ar',Math.min(PHI,Math.max(.8,nx.naturalWidth/nx.naturalHeight)).toFixed(4));
      nx.classList.add('is-on');on&&on.classList.remove('is-on')};
    if(on&&on.getAttribute('src')===a.src)return;
    nx.onload=()=>done(false);nx.onerror=()=>done(true);nx.removeAttribute('src');nx.src=a.src};
  node.addEventListener('click',e=>{const b=e.target.closest('[data-at]');if(b){show(+b.dataset.at);return}
    if(e.target.closest('.sm-pstage')&&all[at]&&!box.classList.contains('is-noimg'))zoom(all[at].src,it.title+', '+all[at].cap)});
  if(picker)picker.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b)show(+b.dataset.v)});
  return{node,picker,start(){show(0)},destroy(){tok++}};
}

/* video: trình phát đúng tỷ lệ, preload none, dừng khi rời; có before thì thêm thanh so sánh trước/sau trên khung hình */
function stageVideo(it){
  const r=it.raw,ra=RATIO[str(r.ratio)]||RATIO['16:9'],poster=str(r.poster)||it.cover,before=poster?str(r.before):'';
  const node=el('div','sm-vid',`<div class="sm-vframe" data-imgbox style="--ar:${ra[0]}/${ra[1]};--arn:${(ra[0]/ra[1]).toFixed(4)}"><span class="sm-mono" aria-hidden="true">${mono(it.title)}</span>
     <video playsinline preload="none"${poster?` poster="${esc(poster)}"`:''} src="${esc(str(r.src))}" aria-label="Phim mẫu ${esc(it.title)}"></video>
     <button class="sm-play" type="button" data-play aria-label="Phát phim ${esc(it.title)}" data-cursor="Phát"><svg viewBox="0 0 26 26" aria-hidden="true"><path d="M10 7.5v11l9-5.5z" fill="currentColor"/></svg></button>
     ${before?`<div class="sm-cmp" hidden style="--p:50%"><img class="a" src="${esc(poster)}" alt="Khung hình sau khi chỉnh"><img class="b" src="${esc(before)}" alt="Khung hình trước khi chỉnh"><span class="sm-cl b">Trước</span><span class="sm-cl a">Sau</span><i class="sm-ch" aria-hidden="true"></i><input type="range" min="0" max="100" value="50" step="0.1" aria-label="Kéo để so sánh trước và sau khi chỉnh"></div>`:''}
     <p class="sm-vmsg" hidden>Phim chưa tải được ở môi trường này.</p></div>
   <div class="sm-vbar">${before?segHTML('Chế độ xem',[['film','Xem phim'],['cmp','Trước / Sau']],'vm'):''}<span class="sm-vmeta">${RATIO[str(r.ratio)]?`<span>Tỷ lệ ${esc(str(r.ratio))}</span>`:''}${+r.duration?`<span>${dur(r.duration)}</span>`:''}</span></div>`);
  const frame=$('.sm-vframe',node),v=$('video',node),cmp=$('.sm-cmp',node),msg=$('.sm-vmsg',node);
  const play=()=>{v.controls=true;frame.classList.add('is-on');const p=v.play();p&&p.catch&&p.catch(()=>{})};
  v.addEventListener('error',()=>{if(!v.getAttribute('src'))return;frame.classList.remove('is-on');frame.classList.add('is-bad');v.controls=false;msg.hidden=false});
  v.addEventListener('ended',()=>{frame.classList.remove('is-on');v.controls=false;try{v.currentTime=0}catch(e){}});
  const setMode=m=>{segSet(node,'vm',m);if(!cmp)return;const c=m==='cmp';if(c){v.pause();v.controls=false;frame.classList.remove('is-on')}cmp.hidden=!c;frame.classList.toggle('is-cmp',c)};
  node.addEventListener('click',e=>{if(e.target.closest('[data-play]')){play();return}const b=e.target.closest('[data-vm]');if(b)setMode(b.dataset.vm)});
  if(cmp)$('input',cmp).addEventListener('input',e=>cmp.style.setProperty('--p',e.target.value+'%'));
  return{node,start(){setMode('film')},destroy(){try{v.pause();v.removeAttribute('src');v.load()}catch(e){}}};
}

/* interactive: item.mount(el) tự vẽ; trả về hàm dọn dẹp, gọi khi rời */
function stageLive(it){
  const node=el('div','sm-live',`<div class="sm-live-bar"><span class="sm-sim"><i class="sm-dot"></i>Demo mô phỏng</span><span class="sm-live-h">Thao tác trực tiếp trong khung bên dưới</span><button class="btn sm" type="button" data-replay>Chạy lại</button></div><div class="sm-live-box"></div>`);
  const box=$('.sm-live-box',node);let off=null;
  const un=()=>{if(off){try{off()}catch(e){console.warn('[samples] dọn dẹp lỗi',it.id,e)}off=null}};
  const mount=()=>{un();box.replaceChildren();
    try{const r=it.raw.mount(box);off=typeof r==='function'?r:null}
    catch(e){console.warn('[samples] mẫu tương tác lỗi',it.id,e);off=null;box.innerHTML=`<div class="sm-live-bad" data-imgbox>${coverHTML(it,true)}<p>Demo này chưa chạy được ở đây.</p></div>`}};
  node.addEventListener('click',e=>{if(e.target.closest('[data-replay]'))mount()});
  return{node,wide:true,start:mount,destroy:un};
}
function stageImage(it){
  const node=el('div','sm-prod',`<div class="sm-pstage" data-imgbox style="--a:${((it.i*137.5)%360).toFixed(1)}deg">${it.cover?`<img class="sm-pi is-on" src="${esc(it.cover)}" alt="${esc(it.title)}">`:''}<span class="sm-mono" aria-hidden="true">${mono(it.title)}</span></div>`);
  return{node,start(){},destroy(){}};
}
const STAGE={site:stageSite,product:stageProduct,video:stageVideo,interactive:stageLive,image:stageImage};

/* ───────── trang chi tiết ───────── */
function facts(it){const r=it.raw,f=[['Loại',KIND_LABEL[it.kind]]];
  if(it.kind==='site')f.push(['Xem trên',[str(r.long)&&'Máy tính',str(r.longM)&&'Điện thoại'].filter(Boolean).join(' · ')||'Demo trực tiếp']);
  if(it.kind==='product'){f.push(['Mẫu mã',it.vars.length+' lựa chọn']);it.gal.length&&f.push(['Ảnh bổ sung',it.gal.length+' ảnh'])}
  if(it.kind==='video'){+r.duration&&f.push(['Thời lượng',dur(r.duration)]);RATIO[str(r.ratio)]&&f.push(['Tỷ lệ',str(r.ratio)]);str(r.before)&&f.push(['So sánh','Trước / sau khi chỉnh'])}
  if(it.kind==='interactive')f.push(['Cách xem','Tự thao tác, không cần cài đặt']);
  f.push(['Ngành',it.industry]);return f}
function leaveStage(){if(stage){try{stage.destroy()}catch(e){console.warn('[samples]',e)}stage=null}zoom(null)}
function renderDetail(it,dir){
  leaveStage();cur=it;
  const c=catOf(it.cat),t=it.tier,idx=list.indexOf(it),n=list.length,pv=list[(idx-1+n)%n],nx=list[(idx+1)%n];
  const note=`Mẫu tham khảo: ${it.title} (${c.name})`;
  const d=el('article','sm-d');d.dataset.kind=it.kind;
  let st;try{st=(STAGE[it.kind]||stageImage)(it)}catch(e){console.warn('[samples] không dựng được mẫu',it.id,e);st=stageImage(it)}
  d.dataset.layout=st.wide?'wide':'split';
  d.innerHTML=`<div class="sm-d-head">
     <p class="sm-d-eb"><span>${esc(c.name)}</span><span>${esc(it.industry)}</span><span class="tag-concept">Concept</span></p>
     <h2 class="sm-d-title" tabindex="-1">${esc(it.title)}</h2>
     ${it.desc?`<p class="sm-d-desc">${esc(it.desc)}</p>`:''}
     ${it.tags.length?`<div class="chips">${it.tags.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div>`:''}
     <div class="sm-d-slot"></div>
     <dl class="sm-facts">${facts(it).map(f=>`<div><dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd></div>`).join('')}</dl>
    </div>
    <div class="sm-d-stage"></div>
    <aside class="sm-pkg" aria-label="Gói giá gợi ý">${t?`<span class="sm-pkg-l">Gói giá gợi ý cho mẫu này</span><b class="sm-pkg-n">${esc(t.label)}</b>
      <span class="sm-pkg-p">${t.price}${t.unit?`<small>${esc(t.unit)}</small>`:''}</span>
      <span class="sm-pkg-m"><span>${esc(t.t.t||'')}</span><span>${esc(t.t.r||'')}</span></span>
      <a class="btn primary" href="#lien-he" data-pick="${esc(t.label)}" data-pick-note="${esc(note)}">Chọn mẫu này ${ARROW}</a>
      <a class="sm-lk" href="#p-${esc(c.id)}">Xem cả bảng giá ${esc(c.name)}</a>`
     :`<span class="sm-pkg-l">Thích mẫu này?</span><a class="btn primary" href="#lien-he" data-pick="${esc(c.name)}" data-pick-note="${esc(note)}">Chọn mẫu này ${ARROW}</a>`}
      <p class="sm-pkg-x">Mẫu concept do Dream Labs tự thiết kế. Khi đặt làm, nội dung, màu và hình ảnh được may đo lại theo thương hiệu của bạn.</p></aside>
    ${n>1?`<nav class="sm-d-nav" aria-label="Mẫu khác">${[[pv,-1,'Mẫu trước'],[nx,1,'Mẫu tiếp theo']].map(([o,k,l])=>`<button class="sm-nb${k>0?' n':''}" type="button" data-sm-go="${k}"><span class="sm-nb-i" data-imgbox>${coverHTML(o)}</span><span class="sm-nb-t"><small>${l}</small><b>${esc(o.title)}</b></span></button>`).join('')}</nav>`:''}`;
  $('.sm-d-stage',d).append(st.node);
  const slot=$('.sm-d-slot',d);st.picker?slot.append(st.picker):slot.remove();
  detailV.replaceChildren(d);detailV.scrollTop=0;stage=st;
  $('.sm-back span',crumb).textContent='Mẫu '+c.name;$('.sm-count',crumb).textContent=pad(idx+1)+' / '+pad(n);$('.sm-pn',crumb).hidden=n<2;
  ctaBar.innerHTML=`<span class="sm-cta-t"><small>${t?esc(t.label):esc(c.name)}</small><b>${t?t.price+(t.unit?`<i>${esc(t.unit)}</i>`:''):esc(it.title)}</b></span><a class="btn primary" href="#lien-he" data-pick="${esc(t?t.label:c.name)}" data-pick-note="${esc(note)}">Chọn mẫu này</a>`;
  ctaBar.hidden=false;
  try{st.start()}catch(e){console.warn('[samples] mẫu không khởi động được',it.id,e)}
  $$('img',d).forEach(im=>{if(im.complete&&im.getAttribute('src')&&!im.naturalWidth)im.dispatchEvent(new Event('error'))});
  if(g&&!RM){const x=dir?dir*42:0;
    g.fromTo($('.sm-d-stage',d),{x,y:dir?0:26,opacity:0},{x:0,y:0,opacity:1,duration:.686,ease:'expo.out',clearProps:'transform,opacity'});
    g.fromTo([...$('.sm-d-head',d).children,$('.sm-pkg',d)],{y:16,opacity:0},{y:0,opacity:1,duration:.686,ease:'expo.out',stagger:.062,delay:.1,clearProps:'transform,opacity'})}
}
function openDetail(id,dir){
  let it=list.find(x=>x.id===id);
  if(!it){it=items(cat).find(x=>x.id===id);if(!it)return false;filter='all';renderFilter();renderGrid(false)}
  if(!cur)gridTop=gridV.scrollTop;
  shell.classList.add('is-detail');gridV.inert=true;detailV.inert=false;
  renderDetail(it,dir||0);
  if(!dir){const h=$('.sm-d-title',detailV);h&&h.focus({preventScroll:true})}
  return true;
}
function backToGrid(){
  if(!cur)return;const id=cur.id;leaveStage();cur=null;
  shell.classList.remove('is-detail');gridV.inert=false;detailV.inert=true;detailV.replaceChildren();ctaBar.hidden=true;ctaBar.replaceChildren();
  gridV.scrollTop=gridTop;
  const b=$$('.sm-card-b',grid).find(x=>x.dataset.id===id);b&&b.focus({preventScroll:true});
  if(g&&!RM)g.fromTo(gridV.firstElementChild,{opacity:0,y:16},{opacity:1,y:0,duration:.424,ease:'power3.out',clearProps:'transform,opacity'});
}
function step(k){if(!cur||list.length<2)return;const i=list.indexOf(cur),n=list.length;openDetail(list[(i+k+n)%n].id,k)}
function stepBack(){if(!zoomBox.hidden)zoom(null);else if(cur)backToGrid();else close()}

/* ───────── mở / đóng ───────── */
function open(c,id,from){
  if(!liveCats().length)return false;
  if(!c||!items(c).length){if(id){const hit=CATS.find(x=>items(x.id).some(it=>it.id===id));c=hit?hit.id:''}if(!c||!items(c).length)c=liveCats()[0].id}
  build();
  if(closing){closing=false;closeId++;if(g){g.killTweensOf(shell);g.set(shell,{clearProps:'clipPath'})}} // đang đóng dở mà được gọi mở lại: hủy đóng
  const fresh=!dlg.open;
  if(cur)backToGrid();
  if(fresh||c!==cat)setCat(c,!fresh);
  if(fresh){
    try{D.modal.close()}catch(e){}
    closing=false;shell.classList.remove('is-detail');gridV.inert=false;detailV.inert=true;
    cleaned=false;dlg.showModal();document.dispatchEvent(new CustomEvent('dl:cover',{detail:{on:true}}));
    const stop=()=>{dlg.open&&D.lenis&&D.lenis.stop()};stop();setTimeout(stop,0);
    gridV.scrollTop=0;
    if(g&&!RM){
      g.fromTo(shell,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.686,ease:'power3.inOut',clearProps:'clipPath'});
      g.fromTo($$('.sm-l>span',heroBox),{yPercent:110},{yPercent:0,duration:1.11,ease:'expo.out',stagger:.1,delay:.382,clearProps:'transform'});
      g.fromTo([$('.sm-top',dlg),$('.eyebrow',heroBox),$('.sm-hero-s',heroBox),filterBox],{y:26,opacity:0},{y:0,opacity:1,duration:.686,ease:'expo.out',stagger:.062,delay:.424,clearProps:'transform,opacity'});
      g.fromTo($$('.sm-card',grid),{y:68,opacity:0},{y:0,opacity:1,duration:1.11,ease:'expo.out',stagger:.1,delay:.618,clearProps:'transform,opacity'});
    }
    gridV.focus({preventScroll:true});
  }
  if(id)openDetail(id,0);
  return true;
}
function close(now){
  if(!dlg||!dlg.open||closing&&!now)return;
  const shut=()=>{if(dlg.open)dlg.close();onClosed()}; // dọn dẹp + mở lại Lenis ngay (không chờ sự kiện close) để lệnh cuộn kế tiếp không bị hủy
  if(now||RM||!g){g&&g.killTweensOf(shell);shut();return}
  const my=++closeId;closing=true;g.to(shell,{clipPath:'inset(0% 0% 100% 0%)',duration:.424,ease:'power3.inOut',onComplete:shut});
  setTimeout(()=>{closing&&my===closeId&&shut()},1110); // phòng khi tab bị bóp khung hình, tween không chạy hết
}
function onClosed(){
  if(cleaned)return;cleaned=true;
  leaveStage();cur=null;closing=false;
  if(g){g.killTweensOf(shell);g.set(shell,{clearProps:'clipPath'})}
  shell.classList.remove('is-detail');detailV.replaceChildren();ctaBar.hidden=true;ctaBar.replaceChildren();
  D.lenis&&D.lenis.start();document.dispatchEvent(new CustomEvent('dl:cover',{detail:{on:false}}));
}
function onClick(e){
  const t=e.target;if(!t.closest)return;
  if(t.closest('[data-sm-close]')){close();return}
  if(t.closest('[data-sm-back]')){backToGrid();return}
  const go=t.closest('[data-sm-go]');if(go){step(+go.dataset.smGo);return}
  const c=t.closest('.sm-cat');if(c){if(c.dataset.c!==cat)setCat(c.dataset.c,true);return}
  const f=t.closest('.sm-chip');if(f){setFilter(f.dataset.f);return}
  const card=t.closest('.sm-card-b');if(card)openDetail(card.dataset.id,0)
}
function onKey(e){
  if(e.key==='Escape'){e.preventDefault();escAt=performance.now();stepBack();return}
  if(!cur||!zoomBox.hidden||e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.target.closest&&e.target.closest('input,textarea,select,video,[contenteditable],.sm-live-box,.sm-shot,.sm-gal,.sm-sws'))return;
  if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}else if(e.key==='ArrowRight'){e.preventDefault();step(1)}
}

/* ───────── lối vào: nút dưới mỗi hạng mục giá, dải #phong-mau, liên kết [data-sm-open] ───────── */
function wire(){
  if(wired)return;wired=true;
  const live=liveCats(),sum=total();
  $$('[data-sm-slot]').forEach(s=>{const c=catOf(s.dataset.smSlot),its=c?items(c.id):[];
    if(!its.length){s.hidden=true;s.replaceChildren();return}
    s.innerHTML=`<button class="sm-open" type="button" data-sm-open="${c.id}" data-cursor="Mở">
      <span class="sm-open-th" aria-hidden="true">${its.slice(0,3).map(it=>`<span data-imgbox>${it.cover?`<img src="${esc(it.cover)}" width="1280" height="791" alt="" loading="lazy" decoding="async">`:''}</span>`).join('')}</span>
      <span class="sm-open-t">Xem mẫu ${esc(c.name)}</span><span class="sm-open-n">${its.length} mẫu</span>${ARROW}</button>`});
  const strip=$('#phong-mau');
  if(strip&&live.length){strip.hidden=false;
    strip.innerHTML=`<div class="sm-strip-l"><svg viewBox="-1 -1 57 36" aria-hidden="true"><path d="${SPIRAL}"/></svg><p><b>Phòng mẫu</b><span>${sum} mẫu concept xa xỉ để bạn xem, thử và chọn</span></p></div>
     <div class="sm-strip-c" role="group" aria-label="Mở phòng mẫu theo hạng mục">${live.map(c=>`<button class="sm-strip-b" type="button" data-sm-open="${c.id}">${esc(c.name)}<sup>${pad(items(c.id).length)}</sup></button>`).join('')}</div>`}
  $$('a[data-sm-open][hidden]').forEach(a=>{a.hidden=!live.length});
  document.addEventListener('error',e=>{const im=e.target;if(im&&im.tagName==='IMG'&&im.closest('.sm-open-th'))im.classList.add('sm-err')},true);
  D.refresh&&D.refresh();
}
/* bắt click sớm (capture) để đi trước xử lý anchor của core.js / kit.js */
document.addEventListener('click',e=>{
  if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||!e.target.closest)return;
  const o=e.target.closest('[data-sm-open]');
  if(o){if(open(o.dataset.smOpen||'',o.dataset.smId||'',o))e.preventDefault();return}
  /* liên kết #… bên trong phòng mẫu (bảng giá, tư vấn): đóng phòng trước rồi để core.js cuộn tới */
  if(dlg&&dlg.open){const a=e.target.closest('a[href^="#"]');if(a&&dlg.contains(a)&&!a.hasAttribute('data-pick'))close(true)}
},true);
document.addEventListener('dl:pick',()=>close(true));
D.samples={open:(c,id)=>open(c||'',id||''),close:()=>close(),count:c=>c?items(c).length:total(),items:c=>items(c).map(it=>it.raw)};
D.ready(wire);
})();
