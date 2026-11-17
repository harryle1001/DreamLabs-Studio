/* Dream Labs — Session C: #showreel (video dựng bằng code) + #lab (5 demo tương tác, tất cả là mô phỏng, không gọi API).
   Chỉ demo đang mở và đang nằm trong khung nhìn mới chạy; ra khỏi khung nhìn là dừng mọi vòng lặp. */
(()=>{
const DL=window.DL;if(!DL)return;
const g=DL.gsap,RM=DL.RM,GA=Math.PI*(3-Math.sqrt(5)); // góc vàng 137.5°
const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chars=s=>[...s].map(c=>`<span>${c===' '?'&nbsp;':esc(c)}</span>`).join('');
const inView=(node,cb,opt)=>{if(!('IntersectionObserver' in window)){cb(true);return}new IntersectionObserver(es=>es.forEach(e=>cb(e.isIntersecting)),opt||{threshold:.2}).observe(node)};
const onResize=(node,fn)=>{let t=0,w=node.clientWidth;const run=()=>{if(node.clientWidth===w)return;w=node.clientWidth;clearTimeout(t);t=setTimeout(fn,162)};
  if('ResizeObserver' in window)new ResizeObserver(run).observe(node);else addEventListener('resize',run)};
const seg=(root,sel,fn)=>{const bs=$$(sel,root);bs.forEach(b=>{b.setAttribute('aria-pressed',b.classList.contains('is-on'));b.addEventListener('click',()=>{if(b.classList.contains('is-on'))return;
  bs.forEach(x=>{const on=x===b;x.classList.toggle('is-on',on);x.setAttribute('aria-pressed',on)});fn(b)})})};

/* ============================== SHOWREEL ============================== */
function initReel(){
  const sec=$('#showreel');if(!sec)return;
  const stage=$('.reel-stage',sec),frame=$('.reel-frame',sec),v=$('.reel-video',sec),btn=$('.reel-toggle',sec),bar=$('.reel-bar i',sec),time=$('.reel-time',sec),chips=$$('.reel-chapters button',sec);
  const T=chips.map(c=>+c.dataset.t),D0=21,fmt=s=>'0:'+String(Math.floor(s)).padStart(2,'0');
  let userPaused=RM,vis=false,raf=0;
  const paint=()=>{const d=v.duration||D0,t=Math.min(d,v.currentTime||0);bar.style.transform=`scaleX(${(t/d).toFixed(4)})`;time.textContent=fmt(t)+' / '+fmt(d);
    let k=0;for(let i=0;i<T.length;i++)if(t>=T[i]-.02)k=i;
    chips.forEach((c,i)=>{const on=i===k,end=i+1<T.length?T[i+1]:d;c.classList.toggle('is-on',on);c.style.setProperty('--p',on?Math.max(0,Math.min(1,(t-T[i])/(end-T[i]))).toFixed(3):0)})};
  const loop=()=>{paint();raf=requestAnimationFrame(loop)};
  const sync=()=>{const on=!v.paused&&!v.ended;frame.classList.toggle('is-playing',on);btn.setAttribute('aria-label',on?'Tạm dừng showreel':'Phát showreel');cancelAnimationFrame(raf);on?loop():paint()};
  const play=x=>{const p=x.play();p&&p.catch&&p.catch(()=>{})};
  ['play','pause','ended'].forEach(e=>v.addEventListener(e,sync));['seeked','loadedmetadata'].forEach(e=>v.addEventListener(e,paint));
  frame.addEventListener('click',()=>{if(v.paused){userPaused=false;play(v)}else{userPaused=true;v.pause()}});
  chips.forEach(c=>c.addEventListener('click',()=>{try{v.currentTime=+c.dataset.t+.02}catch(e){}userPaused=false;play(v)}));
  inView(frame,on=>{vis=on;if(on&&!userPaused)play(v);else if(!on)v.pause()},{threshold:.26});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)v.pause();else if(vis&&!userPaused)play(v)});
  paint();
  if(g&&window.ScrollTrigger&&!RM)g.fromTo(frame,{scale:innerWidth<760?.86:.618},{scale:1,ease:'none',scrollTrigger:{trigger:stage,start:'top bottom',end:'top 26%',scrub:true}});
  /* bản dọc 9:16 */
  const vv=$('.reel-video-v',sec);
  if(vv){let stop=RM,seen=false;inView(vv,on=>{seen=on;if(on&&!stop)play(vv);else vv.pause()},{threshold:.38});
    vv.parentElement.addEventListener('click',()=>{if(vv.paused){stop=false;play(vv)}else{stop=true;vv.pause()}});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)vv.pause();else if(seen&&!stop)play(vv)})}
}

/* ============================== LAB: khung tab ============================== */
function initLab(){
  const sec=$('#lab');if(!sec)return;
  const bar=$('.lab-tabs',sec),tabs=$$('.lab-tab',sec),panels=$$('.lab-panel',sec);
  const make={chat:chatDemo,flow:flowDemo,motion:motionDemo,grade:gradeDemo,build:buildDemo},demos={};
  let cur='chat',vis=false;
  const get=k=>{if(!demos[k]){try{demos[k]=make[k]($(`.lab-panel[data-lab="${k}"]`,sec))}catch(e){console.error(e);demos[k]={enter(){},leave(){}}}demos[k].on=false}return demos[k]};
  const apply=()=>{for(const k in make){const want=vis&&k===cur;if(!want&&!demos[k])continue;const d=get(k);if(want&&!d.on){d.on=true;d.enter()}else if(!want&&d.on){d.on=false;d.leave()}}};
  const select=(k,focus)=>{if(k===cur||!make[k])return;cur=k;
    tabs.forEach(t=>{const on=t.dataset.lab===k;t.classList.toggle('is-on',on);t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;
      if(on){focus&&t.focus({preventScroll:true});if(bar.scrollWidth>bar.clientWidth)bar.scrollTo({left:t.offsetLeft-(bar.clientWidth-t.offsetWidth)/2,behavior:RM?'auto':'smooth'})}});
    panels.forEach(p=>{p.hidden=p.dataset.lab!==k});
    const p=$(`.lab-panel[data-lab="${k}"]`,sec);
    if(g&&!RM)g.fromTo([...p.children],{y:26,opacity:0},{y:0,opacity:1,duration:.686,ease:'expo.out',stagger:.1,clearProps:'transform,opacity'});
    apply();DL.refresh()};
  tabs.forEach((t,i)=>{t.addEventListener('click',()=>select(t.dataset.lab));
    t.addEventListener('keydown',e=>{const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;e.preventDefault();select(tabs[(i+d+tabs.length)%tabs.length].dataset.lab,true)})});
  /* giá "từ …" lấy từ DL_DATA để luôn khớp bảng giá */
  const cats=(window.DL_DATA&&window.DL_DATA.CATS)||[];
  $$('[data-lab-price]',sec).forEach(b=>{const [id,i]=b.dataset.labPrice.split(':'),c=cats.find(x=>x.id===id),t=c&&c.tiers[+i];if(t)b.textContent='Từ '+DL.vnd(t.p)+(t.u||'')});
  inView($('.lab-stage',sec),on=>{vis=on;apply()},{threshold:.08});
  document.addEventListener('visibilitychange',()=>{const was=vis;if(document.hidden){vis=false;apply();vis=was}else apply()});
}

/* ============================== 1. Trợ lý AI bán hàng (kịch bản soạn sẵn) ============================== */
function chatDemo(root){
  const box=$('.lab-msgs',root),quick=$('.lab-quick',root),form=$('.lab-input',root),input=$('input',form),read=$('.lab-read-out',root),list=$('.lab-order-list',root),empty=$('.lab-orders-empty',root);
  const P={ol:{n:'Ô long sen',d:'hộp 100g',p:185000,k:/o ?long|\bsen\b/},cuc:{n:'Hoa cúc mật ong',d:'hộp 80g',p:145000,k:/cuc|mat ong/},qua:{n:'Hộp quà Lá Lửng',d:'3 vị trà',p:420000,k:/hop qua|\bqua\b|\bset\b|tang|bieu/}};
  const st={step:'idle',prod:null,qty:1,who:'',addr:'',ship:0,n:0,orders:0,rev:0,started:false,id:1041};
  const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
  const HARD=['price','ship','human'],HOME=[['Xem giá'],['Phí ship thế nào?'],['Tư vấn giúp mình'],['Mình muốn đặt hàng']];
  let queue=Promise.resolve();
  const wait=ms=>new Promise(r=>setTimeout(r,RM?Math.min(ms,100):ms));
  const down=()=>{box.scrollTop=box.scrollHeight};
  const add=(who,html)=>{const m=el('div','lab-msg '+who,html);box.append(m);down();
    if(g&&!RM)g.from(m,{y:16,opacity:0,scale:.94,duration:.424,ease:'expo.out',transformOrigin:who==='me'?'100% 100%':'0% 100%'});return m};
  const kpi=()=>{$('[data-k="msgs"]',root).textContent=st.n;$('[data-k="orders"]',root).textContent=st.orders;$('[data-k="rev"]',root).textContent=DL.vnd(st.rev)};
  const bot=html=>{queue=queue.then(async()=>{const t=el('div','lab-msg bot lab-typing','<i></i><i></i><i></i>');box.append(t);down();
    await wait(424+Math.min(686,html.replace(/<[^>]+>/g,'').length*8));t.remove();add('bot',html);st.n++;kpi()})};
  const chips=arr=>{queue=queue.then(()=>{quick.replaceChildren(...arr.map(([label,val])=>{const b=el('button');b.type='button';b.textContent=label;b.dataset.v=val||label;return b}));
    quick.scrollLeft=0;if(g&&!RM)g.from([...quick.children],{y:10,opacity:0,duration:.262,stagger:.062,ease:'power2.out'})})};
  const understood=(intent,extra)=>{read.innerHTML=`Ý định: <b>${intent}</b>${extra?' · '+extra:''}`;if(g&&!RM)g.fromTo(read.parentElement,{scale:.96},{scale:1,duration:.424,ease:'back.out(2.6)'})};
  const intentOf=t=>/\bdat\b|\bmua\b|chot|\blay\b|order|dat hang/.test(t)?'order':/\bgia\b|bao nhieu|nhieu tien|menu|san pham|co gi/.test(t)?'price':/ship|giao|van chuyen|bao lau|khi nao/.test(t)?'ship'
    :/tu van|goi y|\bnen\b|loai nao/.test(t)?'advise':/nhan vien|nguoi that/.test(t)?'human':/cam on|thank/.test(t)?'thanks':/chao|\bhi\b|hello|\balo\b/.test(t)?'hello':'';
  const findProd=t=>Object.keys(P).find(k=>P[k].k.test(t));
  const prodChips=()=>Object.values(P).map(p=>['Đặt '+p.n]);
  const askPick=pre=>{st.step='pick';bot((pre?pre+' ':'')+'Anh/chị chọn món nào ạ?');chips(prodChips())};
  const askQty=k=>{st.prod=k;st.step='qty';const p=P[k];bot(`Dạ <b>${p.n}</b> (${p.d}) giá ${DL.vnd(p.p)}. Anh/chị lấy mấy hộp ạ?`);chips([['1 hộp'],['2 hộp'],['3 hộp']])};
  const askInfo=()=>{st.step='info';bot('Anh/chị cho em xin tên và số điện thoại nhận hàng nhé.');chips([['Điền mẫu: Chị Lan, 0900 000 000','Chị Lan, 0900 000 000']])};
  const askAddr=()=>{st.step='addr';bot('Mình giao tới đâu ạ?');chips([['Nội thành TP.HCM'],['Tỉnh khác']])};
  const confirm=()=>{st.step='confirm';const p=P[st.prod],sub=p.p*st.qty;st.ship=sub>=400000?0:/hcm|ho chi minh|sai gon|noi thanh|quan \d/.test(norm(st.addr))?20000:32000;
    bot(`Em xác nhận lại đơn ạ:<table><tr><td>${st.qty} × ${p.n}</td><td>${DL.vnd(sub)}</td></tr><tr><td>Phí ship</td><td>${st.ship?DL.vnd(st.ship):'Miễn phí'}</td></tr><tr class="sum"><td>Tổng cộng</td><td>${DL.vnd(sub+st.ship)}</td></tr></table>`);
    chips([['Xác nhận đặt hàng'],['Sửa lại']])};
  const place=()=>{const p=P[st.prod],total=p.p*st.qty+st.ship,id='#LL-'+(++st.id);st.step='idle';
    bot(`Đã chốt đơn <b>${id}</b>. Em vừa ghi vào bảng đơn hàng và báo bộ phận đóng gói. Cảm ơn anh/chị!`);
    queue=queue.then(()=>{st.orders++;st.rev+=total;kpi();empty.hidden=true;
      const li=el('li','',`<b>${id}</b><em>${DL.vnd(total)}</em><span>${st.qty} × ${p.n}</span><small>${esc(st.who)} · ${esc(st.addr)} · đã ghi vào bảng</small>`);list.prepend(li);while(list.children.length>3)list.lastChild.remove();
      understood('Chốt đơn','đã ghi '+id);if(g&&!RM)g.from(li,{x:42,opacity:0,scale:.9,duration:.686,ease:'back.out(1.6)'})});
    chips([['Đặt thêm đơn nữa','Mình muốn đặt hàng'],['Phí ship thế nào?'],['Xem giá']])};
  function handle(text){const t=norm(text),it=intentOf(t),pk=findProd(t);
    if(st.step==='confirm'){if(/xac nhan|dong y|\bok\b|chot|dat hang|\bdat\b/.test(t)){understood('Xác nhận đơn');return place()}if(/sua|doi|huy|khong/.test(t)){understood('Sửa đơn');return askPick('Dạ, mình chọn lại nhé.')}}
    if(st.step==='qty'){const m=t.match(/\d+/),q=m?Math.max(1,Math.min(20,+m[0])):/\bhai\b/.test(t)?2:/\bba\b/.test(t)?3:/\bmot\b/.test(t)?1:0;if(q){st.qty=q;understood('Số lượng',q+' hộp');return askInfo()}}
    if(st.step==='info'&&!HARD.includes(it)){st.who=text.trim().slice(0,40);understood('Thông tin nhận hàng',esc(st.who));return askAddr()}
    if(st.step==='addr'&&!HARD.includes(it)){st.addr=text.trim().slice(0,40);understood('Địa chỉ giao',esc(st.addr));return confirm()}
    if(st.step==='advise'){const k=/ngu|toi|thu gian/.test(t)?'cuc':/sang|tinh|lam viec/.test(t)?'ol':/qua|tang|bieu/.test(t)?'qua':'';
      if(k){const why={cuc:'vị dịu, không caffeine, hợp uống trước giờ ngủ',ol:'thơm sen, tỉnh táo nhẹ nhàng cho buổi sáng',qua:'đủ ba vị trà, hộp cứng sang, kèm thiệp viết tay'}[k];st.step='idle';
        understood('Cần tư vấn','gợi ý '+P[k].n);bot(`Vậy em gợi ý <b>${P[k].n}</b> (${DL.vnd(P[k].p)}): ${why}.`);return chips([['Đặt '+P[k].n],['Xem giá'],['Phí ship thế nào?']])}}
    if(pk&&(it==='order'||st.step==='pick')){understood('Đặt hàng',P[pk].n);return askQty(pk)}
    if(it==='order'){understood('Đặt hàng','chưa chọn món');return askPick('Dạ được ạ.')}
    if(it==='price'){understood('Hỏi giá');st.step='idle';
      bot('Bảng giá của tiệm ạ:<table>'+Object.values(P).map(p=>`<tr><td>${p.n} <span style="opacity:.618">· ${p.d}</span></td><td>${DL.vnd(p.p)}</td></tr>`).join('')+'</table>Đơn từ 400.000đ được miễn phí ship.');return chips([...prodChips(),['Phí ship thế nào?']])}
    if(it==='ship'){understood('Hỏi phí ship');bot('Nội thành TP.HCM 20.000đ, nhận trong ngày. Tỉnh khác 32.000đ, 2 đến 3 ngày. Đơn từ 400.000đ miễn phí ship ạ.');return chips([['Xem giá'],['Mình muốn đặt hàng'],['Tư vấn giúp mình']])}
    if(it==='advise'){understood('Cần tư vấn');st.step='advise';bot('Dạ, anh/chị định uống vào lúc nào ạ?');return chips([['Buổi tối cho dễ ngủ'],['Buổi sáng cho tỉnh táo'],['Mua làm quà']])}
    if(pk){understood('Quan tâm sản phẩm',P[pk].n);bot(`Dạ <b>${P[pk].n}</b> (${P[pk].d}) giá ${DL.vnd(P[pk].p)} ạ. Anh/chị muốn đặt luôn không?`);return chips([['Đặt '+P[pk].n],['Xem giá'],['Phí ship thế nào?']])}
    if(it==='human'){understood('Muốn gặp nhân viên','đã chuyển tiếp');bot('Dạ em đã báo nhân viên. Trong lúc chờ, em vẫn báo giá và nhận đơn giúp anh/chị được ạ.');return chips(HOME)}
    if(it==='thanks'){understood('Cảm ơn');bot('Dạ không có gì ạ. Cần gì anh/chị cứ nhắn em nhé.');return chips(HOME)}
    if(it==='hello'){understood('Chào hỏi');bot('Dạ em chào anh/chị. Em giúp được gì ạ?');return chips(HOME)}
    understood('Chưa rõ','gợi ý lại lựa chọn');bot('Em chưa rõ ý anh/chị. Em trả lời được về giá, phí ship, tư vấn chọn trà và nhận đặt hàng ạ.');chips(HOME)}
  const say=text=>{text=String(text).trim().slice(0,120);if(!text)return;add('me',esc(text));quick.replaceChildren();handle(text)};
  quick.addEventListener('click',e=>{const b=e.target.closest('button');if(b)say(b.dataset.v)});
  form.addEventListener('submit',e=>{e.preventDefault();const t=input.value;input.value='';say(t)});
  return{enter(){if(st.started)return;st.started=true;bot('Chào anh/chị, em là trợ lý AI của tiệm trà Lá Lửng. Em báo giá, tư vấn và nhận đơn ngay tại đây ạ.');chips(HOME)},leave(){}};
}

/* ============================== 2. Luồng tự động hóa ============================== */
function flowDemo(root){
  const map=$('.lab-flow-map',root),svg=$('.lab-flow-svg',root),nodes=$$('.lab-node',root),token=$('.lab-token',root),run=$('.lab-run',root),msg=$('.lab-flow-msg',root),tbody=$('.lab-sheet tbody',root);
  const C=[{n:'Chị Hạnh',m:'Mình cần làm website cho spa, gửi báo giá giúp nhé.',need:'Website',heat:'Cao',own:'Minh'},
    {n:'Anh Quân',m:'Dựng video TikTok bên bạn tính sao một clip?',need:'Edit Video',heat:'Vừa',own:'Thảo'},
    {n:'Chị Vy',m:'Shop mình muốn tự động hóa khâu trả lời và chốt đơn trên Zalo.',need:'Tự động hóa quy trình doanh nghiệp',heat:'Cao',own:'Minh'},
    {n:'Anh Tín',m:'Cho mình xin bảng giá thiết kế bao bì.',need:'Thiết kế sản phẩm',heat:'Vừa',own:'Khoa'}];
  let pts=[],tok=[],wires=[],dots=[],amb=[],tl=null,idx=0,done=0,ready=false,active=false,mp=null;
  const say=h=>{msg.innerHTML=h;if(g&&!RM)g.fromTo(msg,{opacity:.382,y:6},{opacity:1,y:0,duration:.424,ease:'power2.out'})};
  function build(){
    const r=map.getBoundingClientRect();if(!r.width)return;svg.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);
    pts=nodes.map(n=>{const b=$('.lab-node-ic',n).getBoundingClientRect();return{x:b.left-r.left+b.width/2,y:b.top-r.top+b.height/2,r:b.width/2}});
    const vert=Math.abs(pts[1].x-pts[0].x)<10,f=n=>n.toFixed(1);
    const ds=[];tok=[];
    for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];
      if(vert){ds.push(`M${f(a.x)} ${f(a.y+a.r)}L${f(b.x)} ${f(b.y-b.r)}`);tok.push(`M${f(a.x)} ${f(a.y)}L${f(b.x)} ${f(b.y)}`)}
      else{const x1=a.x+a.r,x2=b.x-b.r,mx=(x1+x2)/2,cx=(a.x+b.x)/2;ds.push(`M${f(x1)} ${f(a.y)}C${f(mx)} ${f(a.y)} ${f(mx)} ${f(b.y)} ${f(x2)} ${f(b.y)}`);tok.push(`M${f(a.x)} ${f(a.y)}C${f(cx)} ${f(a.y)} ${f(cx)} ${f(b.y)} ${f(b.x)} ${f(b.y)}`)}}
    svg.innerHTML=ds.map(d=>`<path class="lab-wire" d="${d}"/><path class="lab-wire-on" pathLength="1" d="${d}"/>`).join('')+ds.map(()=>'<circle class="lab-dot" r="3"/>').join('');
    wires=$$('.lab-wire-on',svg);dots=$$('.lab-dot',svg);
    g.set(token,{x:pts[0].x,y:pts[0].y,xPercent:-50,yPercent:-50,opacity:0});
  }
  const ambient=on=>{amb.forEach(t=>t.kill());amb=[];g.set(dots,{opacity:0});if(!on||RM||!ready)return;
    const ws=$$('.lab-wire',svg);dots.forEach((d,i)=>{amb.push(g.fromTo(d,{opacity:.618},{motionPath:{path:ws[i],align:ws[i],alignOrigin:[.5,.5]},opacity:.618,duration:1.796,ease:'none',repeat:-1,delay:i*.262}))})};
  const reset=()=>{tl&&tl.kill();tl=null;nodes.forEach(n=>n.classList.remove('is-on','is-done'));run.disabled=false};
  function addRow(c){const e=$('.lab-sheet-empty',tbody);e&&e.remove();
    const tr=el('tr','',`<td>${c.n}</td><td>${c.need}</td><td><span class="lab-heat${c.heat==='Cao'?' hi':''}">${c.heat}</span></td><td class="own">…</td>`);tbody.prepend(tr);while(tbody.children.length>4)tbody.lastChild.remove();
    if(!RM)g.from(tr.children,{opacity:0,x:-16,duration:.424,stagger:.062,ease:'power2.out'});return tr}
  function go(){
    if(!ready||(tl&&tl.isActive()))return;reset();if(!pts.length)build();if(!pts.length)return;ambient(false);
    const c=C[idx++%C.length];let row=null;const secs=(3.8+((idx*7)%5)*.3).toFixed(1).replace('.',',');
    run.disabled=true;token.firstElementChild.textContent=c.n.split(' ').pop()[0];
    g.set(wires,{strokeDashoffset:1});g.set(token,{x:pts[0].x,y:pts[0].y,opacity:0,scale:.4});
    const steps=[()=>say(`<b>${c.n}</b> vừa nhắn: “${c.m}”`),
      ()=>say(`AI đọc tin nhắn: nhu cầu <b>${c.need}</b>, mức ưu tiên <b>${c.heat}</b>.`),
      ()=>{row=addRow(c);say('Đã ghi thêm một dòng vào Google Sheets.')},
      ()=>{if(row)$('.own',row).textContent=c.own;say(`Tạo khách trong CRM và giao cho <b>${c.own}</b>.`)},
      ()=>{done++;$('[data-k="done"]',root).textContent=done;$('[data-k="time"]',root).textContent=secs+' giây';say(`Đã báo nhóm bán hàng. ${c.own} gọi lại cho ${c.n} trong 5 phút. Cả quy trình mất <b>${secs} giây</b>, không ai phải nhập tay.`)}];
    tl=g.timeline({onComplete(){run.disabled=false;$('span',run).textContent='Chạy khách tiếp theo';g.to(token,{opacity:0,scale:.4,duration:.262});nodes.forEach(n=>n.classList.remove('is-on'));if(active)ambient(true)}});
    tl.to(token,{opacity:1,scale:1,duration:.424,ease:'back.out(2)'},0);
    nodes.forEach((n,i)=>{const ic=$('.lab-node-ic',n);
      tl.call(()=>{nodes.forEach((x,j)=>{x.classList.toggle('is-on',j===i);if(j<i)x.classList.add('is-done')});steps[i]()})
        .fromTo(ic,{scale:1},{scale:1.16,duration:.262,ease:'power2.out',yoyo:true,repeat:1})
        .to({}, {duration:i===1?.686:.382});
      if(i<nodes.length-1)tl.to(wires[i],{strokeDashoffset:0,duration:.618,ease:'power2.inOut'},'>').to(token,{motionPath:{path:tok[i]},duration:.618,ease:'power2.inOut'},'<')});
    tl.call(()=>nodes[nodes.length-1].classList.add('is-done'));
    if(RM)tl.progress(1);
  }
  run.addEventListener('click',go);
  mp=DL.load('vendor/MotionPathPlugin.min.js').then(()=>{g.registerPlugin(window.MotionPathPlugin);ready=true;build();if(active)ambient(true)}).catch(()=>{say('Không tải được thư viện chuyển động cho demo này.')});
  onResize(map,()=>{if(!ready)return;reset();build();ambient(active)});
  return{enter(){active=true;if(!ready)return;if(tl&&tl.paused())tl.resume();else{if(!tl||!pts.length)build();ambient(true)}},leave(){active=false;ambient(false);tl&&tl.isActive()&&tl.pause()}};
}

/* ============================== 3. Motion graphic chạy trực tiếp ============================== */
function motionDemo(root){
  const stage=$('.lab-mo-stage',root),cv=$('.lab-mo-canvas',root),range=$('.lab-range',root),playBtn=$('.lab-mo-play',root),time=$('.lab-mo-time',root),ticks=$('.lab-mo-ticks',root);
  const BW=600;let tl=null,started=false;
  const fit=()=>{cv.style.transform=`scale(${(stage.clientWidth/BW).toFixed(4)})`};
  const B={
    logo(){let h='';const n=34;for(let i=0;i<n;i++)h+='<i class="sd"></i>';
      cv.innerHTML=h+`<svg class="mn" viewBox="0 0 26 26" aria-hidden="true"><defs><linearGradient id="lab-mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--lav)"/><stop offset=".618" stop-color="var(--peach)"/><stop offset="1" stop-color="var(--mist)"/></linearGradient><clipPath id="lab-mc"><circle cx="13" cy="13" r="12"/></clipPath></defs><circle class="dc" cx="13" cy="13" r="12" fill="url(#lab-mg)"/><g clip-path="url(#lab-mc)"><path class="cs" d="M17 6.5a7.5 7.5 0 1 0 2.5 10.6A6 6 0 0 1 17 6.5z" fill="var(--paper)" opacity=".9"/></g></svg><div class="wm">${chars('Dream')}<em>${chars('Lab')}</em></div><i class="rl"></i><div class="tg">Studio sáng tạo</div>`;
      const sd=$$('.sd',cv),pos=(i,c,k)=>Math[k](i*GA)*c*Math.sqrt(i),t=g.timeline({paused:true});
      t.fromTo(sd,{x:0,y:0,scale:0},{x:i=>pos(i+1,13,'cos'),y:i=>pos(i+1,13,'sin'),scale:i=>.5+i/n,duration:.9,ease:'back.out(1.4)',stagger:.018},.1)
       .to(sd,{x:i=>pos(i+1,42,'cos'),y:i=>pos(i+1,42,'sin'),opacity:.382,duration:1.11,ease:'expo.inOut',stagger:.008},1.3)
       .from($('.dc',cv),{scale:0,transformOrigin:'50% 50%',duration:.9,ease:'back.out(1.6)'},1.5)
       .from($('.cs',cv),{x:-26,y:6,duration:1.11,ease:'expo.out'},1.7)
       .from($$('.wm span',cv),{yPercent:126,duration:.9,ease:'expo.out',stagger:.05},2.1)
       .from($('.rl',cv),{scaleX:0,duration:.686,ease:'expo.out'},2.75)
       .from($('.tg',cv),{opacity:0,y:10,duration:.686,ease:'power2.out'},2.9)
       .to($('.mn',cv),{rotation:8,transformOrigin:'50% 50%',duration:.8,ease:'sine.inOut'},3.4);
      return{t,marks:[.1,1.3,1.5,2.1,2.75,3.4]}},
    type(){cv.innerHTML=`<i class="bk"></i><div class="l l1">${chars('Nói ít.')}</div><div class="l l2">${chars('Chuyển động')}</div><div class="l l3">${chars('nhiều hơn.')}</div><i class="rg"></i><i class="cr"></i><div class="sg">Dream Labs · Motion</div>`;
      const t=g.timeline({paused:true}),bk=$('.bk',cv),l2=$('.l2',cv);g.set(l2,{opacity:0});g.set(bk,{scaleX:0,transformOrigin:'0% 50%'});
      t.from($$('.l1 span',cv),{yPercent:126,rotation:8,duration:.686,ease:'expo.out',stagger:.045},.1)
       .to(bk,{scaleX:1,duration:.424,ease:'power3.in'},.9)
       .set(l2,{opacity:1},1.33).set(bk,{transformOrigin:'100% 50%'},1.33)
       .to(bk,{scaleX:0,duration:.424,ease:'power3.out'},1.34)
       .from($$('.l2 span',cv),{xPercent:-38,opacity:0,duration:.5,ease:'power3.out',stagger:.022},1.34)
       .from($$('.l3 span',cv),{yPercent:126,duration:.686,ease:'back.out(1.6)',stagger:.038},1.9)
       .from($('.cr',cv),{scale:0,duration:.9,ease:'back.out(1.8)'},2.35)
       .from($('.rg',cv),{scale:.4,opacity:0,rotation:-137.5,duration:1.11,ease:'expo.out'},2.45)
       .from($('.sg',cv),{opacity:0,x:-16,duration:.686,ease:'power2.out'},2.9)
       .to($('.l1',cv),{scale:.618,duration:.686,ease:'expo.inOut'},3.3)
       .to($('.cr',cv),{scale:1.16,duration:.686,ease:'expo.inOut'},3.3)
       .to({}, {duration:.4});
      return{t,marks:[.1,.9,1.34,1.9,2.35,3.3]}},
    info(){const V=[34,55,42,68,89,144,110],D=['T2','T3','T4','T5','T6','T7','CN'],H=190,cw=(330-60)/7,px=i=>i*(cw+10)+cw/2,py=v=>220-v/144*H;
      cv.innerHTML=`<div class="tt">Đơn hàng trong tuần</div><div class="st">Số liệu minh họa</div><div class="bars">${V.map((v,i)=>`<i class="bar" style="height:${(v/144*H).toFixed(1)}px"><s></s><b>0</b><u>${D[i]}</u></i>`).join('')}</div>
        <svg class="ln" viewBox="0 0 330 220" aria-hidden="true"><path pathLength="1" d="M${V.map((v,i)=>px(i).toFixed(1)+' '+(py(v)-16).toFixed(1)).join('L')}" fill="none" stroke="var(--ink)" stroke-width="1.6" stroke-dasharray="1" stroke-dashoffset="1" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/></svg>
        <div class="dn"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" stroke-width="10"/><circle class="ar" cx="50" cy="50" r="42" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg><b>0%</b></div><div class="dl">Khách quay lại mua lần hai</div>`;
      const t=g.timeline({paused:true}),bars=$$('.bar',cv),dn=$('.dn b',cv),o={v:0};
      t.from([$('.tt',cv),$('.st',cv)],{opacity:0,y:16,duration:.686,ease:'expo.out',stagger:.1},.1)
       .from($$('.bar s',cv),{scaleY:0,duration:.9,ease:'expo.out',stagger:.1},.5)
       .from($$('.bar u',cv),{opacity:0,duration:.424,stagger:.1},.5);
      bars.forEach((b,i)=>{const lab=$('b',b),c={v:0};t.fromTo(lab,{opacity:0},{opacity:1,duration:.262},.6+i*.1).to(c,{v:V[i],duration:.8,ease:'power2.out',onUpdate(){lab.textContent=Math.round(c.v)}},.6+i*.1)});
      t.to($('.ln path',cv),{strokeDashoffset:0,duration:1.11,ease:'power2.inOut'},1.6)
       .from($('.dn',cv),{scale:.6,opacity:0,duration:.686,ease:'back.out(1.6)'},1.9)
       .to($('.ar',cv),{strokeDashoffset:1-.618,duration:1.11,ease:'expo.inOut'},2.2)
       .to(o,{v:61.8,duration:1.11,ease:'expo.inOut',onUpdate(){dn.textContent=o.v.toFixed(1).replace('.',',')+'%'}},2.2)
       .from($('.dl',cv),{opacity:0,y:10,duration:.686,ease:'power2.out'},2.6)
       .to(bars[5],{y:-6,duration:.262,ease:'power2.out',yoyo:true,repeat:1},3.3)
       .to({}, {duration:.5});
      return{t,marks:[.1,.5,1.6,2.2,3.3]}}
  };
  const ui=()=>{if(!tl)return;const p=tl.progress();range.value=Math.round(p*1000);range.style.setProperty('--v',(p*100).toFixed(1)+'%');time.textContent=tl.time().toFixed(2).replace('.',',')+'s';
    const on=tl.isActive();playBtn.classList.toggle('is-playing',on);playBtn.setAttribute('aria-label',on?'Tạm dừng':'Phát')};
  function load(k,auto){tl&&tl.kill();cv.replaceChildren();cv.className='lab-mo-canvas mo-'+k;const b=B[k]();tl=b.t;
    ticks.innerHTML=b.marks.map(m=>`<i style="left:${(m/tl.duration()*100).toFixed(2)}%"></i>`).join('');
    tl.eventCallback('onUpdate',ui).eventCallback('onComplete',ui);tl.pause(0);ui();if(RM){tl.progress(1);ui()}else if(auto)tl.play(0)}
  const toggle=()=>{if(!tl)return;if(tl.isActive())tl.pause();else if(tl.progress()>=.999)tl.restart();else tl.play();ui()};
  playBtn.addEventListener('click',toggle);stage.addEventListener('click',toggle);
  range.addEventListener('input',()=>{if(!tl)return;tl.pause();tl.progress(range.value/1000);ui()});
  seg(root,'[data-mo]',b=>load(b.dataset.mo,true));
  fit();onResize(stage,fit);load('logo',false);
  return{enter(){fit();if(!started){started=true;if(!RM)tl.play(0)}},leave(){tl&&tl.pause();ui()}};
}

/* ============================== 4. Edit video / chỉnh màu ============================== */
function gradeDemo(root){
  const stage=$('.lab-gr-stage',root),frame=$('.lab-gr-frame',root),range=$('.lab-gr-range',root),where=$('.lab-gr-where',root);
  const scene=id=>`<svg viewBox="0 0 900 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
    <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27264A"/><stop offset=".34" stop-color="#7A5488"/><stop offset=".52" stop-color="#E58A66"/><stop offset=".63" stop-color="#F7D4A2"/></linearGradient>
    <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9966C"/><stop offset=".5" stop-color="#7D5A8C"/><stop offset="1" stop-color="#2B2850"/></linearGradient>
    <radialGradient id="${id}g"><stop offset="0" stop-color="#FFE9BF" stop-opacity=".9"/><stop offset="1" stop-color="#FFE9BF" stop-opacity="0"/></radialGradient></defs>
    <rect width="900" height="900" fill="url(#${id}s)"/>
    <g fill="#FBF8F3" opacity=".7"><circle cx="210" cy="230" r="2.5"/><circle cx="330" cy="150" r="2"/><circle cx="520" cy="215" r="2.5"/><circle cx="640" cy="130" r="2"/><circle cx="730" cy="250" r="2"/><circle cx="110" cy="110" r="2"/><circle cx="440" cy="90" r="2.5"/></g>
    <circle class="gl" cx="450" cy="455" r="170" fill="url(#${id}g)"/><circle cx="450" cy="455" r="58" fill="#FFE7B8"/>
    <g class="cl" fill="#F9C9A6" opacity=".55"><path d="M90 340h180a22 22 0 0 0 0-44h-40a36 36 0 0 0-70 0h-70a22 22 0 0 0 0 44z"/><path d="M600 300h150a18 18 0 0 0 0-36h-30a30 30 0 0 0-58 0h-62a18 18 0 0 0 0 36z"/></g>
    <path d="M0 520L110 430 200 500 330 380 450 500 540 440 660 520 790 410 900 500V570H0z" fill="#5A4677"/>
    <path d="M0 548L140 480 260 530 380 470 520 540 640 495 780 545 900 505V575H0z" fill="#3B315B"/>
    <rect y="562" width="900" height="338" fill="url(#${id}w)"/>
    <g class="rf" stroke="#FFE7B8" stroke-width="5" stroke-linecap="round" opacity=".6"><path d="M395 592h110M370 620h160M410 650h80M350 686h200M400 726h100"/></g>
    <g fill="#1B1830"><path d="M318 652h132l-18 24h-96z"/><path d="M386 646v-70l44 62z"/></g>
    <g stroke="#1B1830" stroke-width="4" fill="none" stroke-linecap="round"><path d="M560 350q12-12 24 0q12-12 24 0M624 318q9-9 18 0q9-9 18 0"/></g>
    <path d="M0 900V790Q120 740 240 780T470 820 720 790 900 810V900z" fill="#1B1830"/>
    <g stroke="#1B1830" stroke-width="5" stroke-linecap="round" fill="none"><path d="M120 800q-8-70 6-120M150 800q4-60-10-100M180 800q10-50 30-90M760 810q-6-64 10-110M790 810q8-50-4-96"/></g></svg>`;
  $('.lab-gr-after',root).innerHTML=scene('lab-ga');$('.lab-gr-before',root).innerHTML=scene('lab-gb');
  const WHERE={'16:9':'YouTube, website · 16:9','1:1':'Bảng tin Facebook, Instagram · 1:1','9:16':'TikTok, Reels, Shorts · 9:16'};
  let ar='16:9',split=38.2,loops=[],dragging=false;
  const setSplit=p=>{split=Math.max(0,Math.min(100,p));frame.style.setProperty('--split',split.toFixed(2)+'%');range.value=Math.round(split*10)};
  const size=()=>{const [a,b]=ar.split(':').map(Number),r=a/b,W=stage.clientWidth*.88,H=stage.clientHeight*.88;return W/H>r?{width:H*r,height:H}:{width:W,height:W/r}};
  const fit=anim=>{if(!stage.clientWidth)return;const s=size();frame.style.aspectRatio='auto';if(anim&&g&&!RM)g.to(frame,{...s,duration:.686,ease:'expo.inOut',overwrite:true});else if(g)g.set(frame,s);else{frame.style.width=s.width+'px';frame.style.height=s.height+'px'}};
  const fromEvent=e=>{const r=frame.getBoundingClientRect();setSplit((e.clientX-r.left)/r.width*100)};
  frame.addEventListener('pointerdown',e=>{dragging=true;try{frame.setPointerCapture(e.pointerId)}catch(x){}fromEvent(e)});
  frame.addEventListener('pointermove',e=>{if(dragging)fromEvent(e)});
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>frame.addEventListener(n,()=>{dragging=false}));
  range.addEventListener('input',()=>setSplit(range.value/10));
  seg(root,'[data-gr]:not(.lab-gr-frame)',b=>{frame.dataset.gr=b.dataset.gr;   // áp tông mới bằng một đường quét từ trái sang
    if(g&&!RM){const to=split,o={p:100};g.to(o,{p:to,duration:.9,ease:'expo.inOut',onUpdate(){setSplit(o.p)}})}});
  seg(root,'[data-ar]',b=>{ar=b.dataset.ar;frame.dataset.ar=ar;where.textContent=WHERE[ar];fit(true)});
  frame.dataset.ar=ar;setSplit(split);onResize(stage,()=>fit(false));
  const ambient=on=>{loops.forEach(t=>t.kill());loops=[];if(!on||RM||!g)return;
    loops.push(g.fromTo($$('.cl',frame),{x:-26},{x:26,duration:6.854,ease:'sine.inOut',yoyo:true,repeat:-1}),
      g.fromTo($$('.gl',frame),{scale:1,transformOrigin:'50% 50%'},{scale:1.1,duration:2.618,ease:'sine.inOut',yoyo:true,repeat:-1}),
      g.fromTo($$('.rf',frame),{opacity:.42},{opacity:.7,duration:1.618,ease:'sine.inOut',yoyo:true,repeat:-1}))};
  return{enter(){fit(false);ambient(true)},leave(){ambient(false)}};
}

/* ============================== 5. Landing page builder mini ============================== */
function buildDemo(root){
  const phone=$('.lab-bd-phone',root),h=$('.lab-bd-h',root),btn=$('.lab-bd-btn',root),code=$('.lab-bd-code',root),ti=$('#lab-bd-title',root),ci=$('#lab-bd-cta',root);
  const FONT={serif:'Fraunces',sans:'Be Vietnam Pro',italic:'Fraunces Italic'},MODE={light:'sáng',dark:'tối'};
  const s={c:'#6247B8',f:'serif',m:'light'};
  const pulse=(nodes,big)=>{if(g&&!RM)g.fromTo(nodes,{scale:big?.94:.97,opacity:.5},{scale:1,opacity:1,duration:.424,ease:'back.out(2.2)',stagger:.062,overwrite:true,clearProps:'transform,opacity'})};
  const out=()=>{code.textContent=`màu ${s.c} · phông ${FONT[s.f]} · nền ${MODE[s.m]}`};
  seg(root,'.lab-bd-sw button',b=>{s.c=b.dataset.c;phone.style.setProperty('--b',s.c);out();pulse([$('.lab-bd-art',root),btn,$('.lab-bd-kicker',root)])});
  seg(root,'[data-f]:not(.lab-bd-phone)',b=>{s.f=b.dataset.f;phone.dataset.f=s.f;out();pulse([h])});
  seg(root,'[data-m]:not(.lab-bd-phone)',b=>{s.m=b.dataset.m;phone.dataset.m=s.m;out();pulse([$('.lab-bd-screen',root)],true)});
  ti.addEventListener('input',()=>{h.textContent=ti.value.trim()||'Tiêu đề của bạn'});
  ci.addEventListener('input',()=>{btn.textContent=ci.value.trim()||'Nút kêu gọi'});
  $('.lab-bd-form',root).addEventListener('submit',e=>e.preventDefault());
  out();
  return{enter(){},leave(){}};
}

DL.ready(()=>{initReel();initLab()});
})();
