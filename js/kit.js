/* DreamLab kit — API dùng chung + motion khai báo. Nạp sau GSAP/ScrollTrigger/SplitText/Lenis, trước core/work/lab.
   Owner: Session A (được mở rộng; KHÔNG đổi/xoá API đã có vì B và C phụ thuộc).
   API: DL.PHI, DL.RM, DL.fine, DL.vnd(n), DL.ready(fn), DL.load(src), DL.scrollTo(target,{offset,immediate}), DL.modal.open({title,node|html,narrow,onClose}), DL.modal.close(), DL.scan(root), DL.refresh(), DL.lenis
        (core.js thêm: DL.go(target) cuộn có màn chuyển cảnh khi nhảy xa · DL.pick(text) điền form liên hệ · DL.isDark() · DL.setTheme('light'|'dark') · sự kiện document 'dl:theme')
   HTML: data-reveal[=up|left|right|scale|clip] data-delay · data-stagger (con trực tiếp lần lượt hiện) · data-split (tiêu đề hiện theo dòng) · data-parallax="0.1"
         data-magnetic · data-tilt · data-count="18000000" data-format="vnd|int" · data-cursor="Xem" (nhãn con trỏ, do core.js hiển thị) */
(()=>{
const PHI=1.61803, RM=matchMedia('(prefers-reduced-motion: reduce)').matches, fine=matchMedia('(pointer:fine)').matches;
const g=window.gsap, ST=window.ScrollTrigger;
if(g&&ST)g.registerPlugin(ST); if(g&&window.SplitText)g.registerPlugin(window.SplitText);
const DL=window.DL={PHI,RM,fine,gsap:g,lenis:null,_ready:[],_done:false};
DL.vnd=n=>Math.round(n).toLocaleString('vi-VN')+'đ';
DL.ready=fn=>{DL._done?fn(DL):DL._ready.push(fn)};
const loaded={};
DL.load=src=>loaded[src]||(loaded[src]=new Promise((ok,no)=>{const s=document.createElement('script');s.src=new URL(src,document.baseURI).href;s.onload=ok;s.onerror=no;document.head.append(s)}));
DL.refresh=()=>{if(!ST)return;try{ST.sort()}catch(e){}ST.refresh()};
DL.scrollTo=(target,o={})=>{
  const el=typeof target==='string'?document.querySelector(target):target; if(el==null)return;
  const head=document.querySelector('.head'), off=o.offset!=null?o.offset:-((head?head.offsetHeight:0)+(o.extra||0));
  if(DL.lenis&&!RM)DL.lenis.scrollTo(el,{offset:off,immediate:!!o.immediate,force:true,duration:o.duration||PHI});
  else{const y=(typeof el==='number'?el:el.getBoundingClientRect().top+scrollY)+off;scrollTo({top:y,behavior:o.immediate||RM?'auto':'smooth'})}
};
/* modal */
let dlg=null,onClose=null;
DL.modal={open({title='',node,html,narrow=false,onClose:oc}={}){
  if(!dlg){dlg=document.createElement('dialog');dlg.className='dl-modal';dlg.innerHTML='<div class="panel" data-lenis-prevent><div class="bar"><b></b><button class="x" aria-label="Đóng">×</button></div><div class="body"></div></div>';
    document.body.append(dlg);dlg.querySelector('.x').onclick=()=>DL.modal.close();
    dlg.addEventListener('click',e=>{if(e.target===dlg)DL.modal.close()});
    dlg.addEventListener('close',()=>{DL.lenis&&DL.lenis.start();const f=onClose;onClose=null;f&&f();dlg.querySelector('.body').replaceChildren()});}
  dlg.classList.toggle('narrow',narrow);dlg.querySelector('.bar b').textContent=title;
  const b=dlg.querySelector('.body');b.replaceChildren();if(node)b.append(node);else if(html)b.innerHTML=html;
  onClose=oc||null;DL.lenis&&DL.lenis.stop();if(!dlg.open)dlg.showModal();
  if(g&&!RM)g.fromTo(dlg.querySelector('.panel'),{y:42,scale:.96,opacity:0},{y:0,scale:1,opacity:1,duration:.424,ease:'expo.out'});
  DL.scan(b);return b;
 },close(){dlg&&dlg.open&&dlg.close()}};
/* motion khai báo */
const seen=new WeakSet();
DL.scan=(root=document)=>{
  if(!g||!ST)return;
  const q=s=>[...root.querySelectorAll(s)].filter(e=>!seen.has(e)&&(seen.add(e),true));
  const below=el=>el.getBoundingClientRect().top>innerHeight*.9; // nội dung trong khung nhìn đầu tiên luôn hiện sẵn
  if(!RM){
    q('[data-reveal]').forEach(el=>{const k=el.dataset.reveal||'up',d=+el.dataset.delay||0,fade=below(el)&&!el.closest('dialog');
      const from={up:{y:42},left:{x:-42},right:{x:42},scale:{scale:.9},clip:{clipPath:'inset(0 0 100% 0)'}}[k]||{y:42};
      if(fade&&k!=='clip')from.opacity=0;
      g.from(el,{...from,duration:1.11,ease:'expo.out',delay:d,scrollTrigger:el.closest('dialog')?undefined:{trigger:el,start:'top 92%'}})});
    q('[data-stagger]').forEach(el=>{const fade=below(el);g.from(el.children,{y:42,opacity:fade?0:1,duration:.9,ease:'expo.out',stagger:.1/PHI,scrollTrigger:{trigger:el,start:'top 88%'}})});
    q('[data-split]').forEach(el=>{if(!window.SplitText)return;const run=()=>{const s=window.SplitText.create(el,{type:'lines',mask:'lines',linesClass:'dl-line'});
      g.from(s.lines,{yPercent:110,duration:1.11,ease:'expo.out',stagger:.1,scrollTrigger:{trigger:el,start:'top 90%'}})};
      (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(run)});
    q('[data-parallax]').forEach(el=>{const v=(+el.dataset.parallax||.1)*100;g.fromTo(el,{yPercent:-v},{yPercent:v,ease:'none',scrollTrigger:{trigger:el.parentElement||el,scrub:true}})});
    q('[data-count]').forEach(el=>{const v=+el.dataset.count,f=el.dataset.format==='vnd'?DL.vnd:n=>Math.round(n).toLocaleString('vi-VN'),step=el.dataset.format==='vnd'?1000:1;
      el.textContent=f(v);ST.create({trigger:el,start:'top 88%',once:true,onEnter:()=>{const o={x:v*.382};g.to(o,{x:v,duration:1.11,ease:'power3.out',onUpdate:()=>el.textContent=f(Math.round(o.x/step)*step)})}})});
    if(fine){
      q('[data-magnetic]').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();g.to(b,{x:(e.clientX-r.left-r.width/2)*.382,y:(e.clientY-r.top-r.height/2)*.382,duration:.424,ease:'power3.out'})});
        b.addEventListener('pointerleave',()=>g.to(b,{x:0,y:0,duration:.686,ease:'elastic.out(1,.4)'}))});
      q('[data-tilt]').forEach(c=>{c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');
        g.to(c,{rotateY:x*6.18,rotateX:-y*6.18,transformPerspective:1100,duration:.424,ease:'power2.out'})});
        c.addEventListener('pointerleave',()=>g.to(c,{rotateY:0,rotateX:0,duration:.686,ease:'expo.out'}))});
    }
  }else q('[data-count]').forEach(el=>{const v=+el.dataset.count;el.textContent=el.dataset.format==='vnd'?DL.vnd(v):v.toLocaleString('vi-VN')});
};
/* Lenis */
if(!RM&&window.Lenis&&g&&ST){try{const l=DL.lenis=new window.Lenis({lerp:.09,wheelMultiplier:.9});l.on('scroll',ST.update);g.ticker.add(t=>l.raf(t*1000));g.ticker.lagSmoothing(0)}catch(e){DL.lenis=null}}
/* anchor mượt cho mọi a[href^="#"] (core.js có thể chặn trước bằng capture để thêm chuyển cảnh) */
document.addEventListener('click',e=>{if(e.defaultPrevented)return;const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1),el=id&&document.getElementById(id);if(!el)return;e.preventDefault();DL.modal.close();DL.scrollTo(el)});
const boot=()=>{DL.scan(document);DL._done=true;DL._ready.splice(0).forEach(f=>{try{f(DL)}catch(e){console.error(e)}});document.dispatchEvent(new CustomEvent('dl:ready'))};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
addEventListener('load',()=>DL.refresh());
})();
