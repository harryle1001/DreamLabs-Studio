/* Navélia 62 — Lễ hạ thủy · teaser sự kiện 16:9, 8 giây. Cảnh quay flycam và ảnh chụp thật lúc hoàng hôn (Pexels); thông số đếm lên (minh họa), tiêu đề, thư mời. */
R3.film({W:1920,H:1080,dur:8,poster:6.2,
  grade:{filter:'contrast(1.1) saturate(1.2)',tint:['#082238','#ffb878'],tintA:.42,vig:.42,grain:.05,fade:[.4,.6]},
  shots:[
    {clip:'a',in:0,out:2.4,cam:[[0,0,0,1.0],[1,0,0,1.06]]},
    {clip:'b',in:2.4,out:4.6,cam:[[0,0,0,1.06],[1,0,0,1.0]],tr:{type:'fade',d:.6}},
    {clip:'c',in:4.6,out:8,rate:.8,cam:[[0,0,0,1.0],[1,0,0,1.08]],tr:{type:'fade',d:.7}}],
  build(tl,g,R){
    const css=document.createElement('style');css.textContent=`
      .hd{left:90px;right:90px;top:70px;display:flex;justify-content:space-between;font-size:16px;letter-spacing:.4em;text-transform:uppercase}
      .sp{left:90px;bottom:110px;display:flex;gap:70px}.sp div b{display:block;font:400 96px/1 "Playfair Display",serif}.sp div span{font-size:16px;letter-spacing:.3em;text-transform:uppercase;opacity:.85}
      .cp{right:90px;bottom:120px;width:120px;height:120px}.cp svg{width:100%;height:100%}
      .T{left:0;right:0;top:250px;text-align:center}.T small{font-size:19px;letter-spacing:.5em;text-transform:uppercase;color:#ffd9a8}.T h1{font:400 170px/1 "Playfair Display",serif;letter-spacing:.14em;margin-top:18px}.T h1 i{color:#ffd9a8}
      .T p{margin-top:24px;font:italic 400 40px "Playfair Display",serif}.T .pill{display:inline-block;margin-top:44px;font-size:17px}`;document.head.appendChild(css);
    R.show(tl,R.el(g,'hd sh','<span>Navélia Yachts</span><span>Concept</span>'),.3,7.2,{y:-8});
    const sp=R.el(g,'sp sh','<div><b>0</b><span>feet chiều dài</span></div><div><b>0</b><span>hải lý / giờ</span></div><div><b>0</b><span>khoang nghỉ</span></div>');R.show(tl,sp,.5,4.5);
    tl.from(sp.children,{autoAlpha:0,y:30,stagger:.15,duration:.5},.55);[[62,.6],[28,.9],[4,1.2]].forEach(([v,t],i)=>R.count(tl,sp.children[i].firstChild,0,v,t,1.2));
    const cp=R.el(g,'cp','<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#fff" stroke-width="1" opacity=".7"/><g class="nd"><path d="M50 10 L56 50 L50 90 L44 50Z" fill="#ffd9a8"/></g><text x="50" y="9" font-size="8" fill="#fff" text-anchor="middle" font-family="Be Vietnam Pro">N</text></svg>');
    R.show(tl,cp,.6,4.5);tl.fromTo(cp.querySelector('.nd'),{rotation:-140,transformOrigin:'50% 50%'},{rotation:32,duration:3.2,ease:'elastic.out(1,.45)'},.7);
    const T=R.el(g,'T sh','<small>Lễ hạ thủy</small><h1>Navélia <i>62</i></h1><p>20 tháng 12 · Vịnh Nha Trang</p><div class="pill">Thư mời riêng</div>');R.show(tl,T,4.9,7.5,{},{d:.5,dOut:.45});
    tl.from(T.children,{autoAlpha:0,y:36,stagger:.16,duration:.7,ease:'power3.out'},4.95);
  }});
