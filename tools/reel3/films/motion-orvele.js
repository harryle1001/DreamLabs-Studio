/* Maison Orvèle — Ambre Minuit · quảng cáo nước hoa 16:9, 8 giây. Ảnh chụp thật (Pexels) + khói thật phủ lớp; Ken Burns, chữ serif hiện từng ký tự, lặp mượt về đen. */
R3.film({W:1920,H:1080,dur:8,poster:5.9,
  grade:{filter:'contrast(1.1) saturate(1.15) brightness(.96)',tint:['#2a1404','#ffcc8a'],tintA:.4,vig:.55,grain:.06,fade:[.5,.6]},
  shots:[
    {photo:'p3',in:0,out:2.2,focus:[.5,.55],cam:[[0,-.03,.02,1.3],[1,.03,-.02,1.12]],ease:'lin'},
    {photo:'p2',in:2.2,out:4.4,focus:[.5,.5],cam:[[0,0,.03,1.25],[1,0,-.02,1.08]],ease:'lin',tr:{type:'fade',d:.7}},
    {photo:'p1',in:4.4,out:8,focus:[.42,.52],cam:[[0,.0,0,1.02],[1,.02,0,1.16]],ease:'lin',tr:{type:'fade',d:.8}}],
  overlays:[{clip:'smoke',in:0,out:8,rate:1,alpha:.3,cam:[[0,0,0,1.1],[1,0,0,1.3]],fin:1,fout:.8}],
  build(tl,g,R){
    const css=document.createElement('style');css.textContent=`
      .k{left:120px;top:110px;font-size:17px;letter-spacing:.42em;text-transform:uppercase;color:#e9c690}
      .w{left:120px;bottom:150px;font:italic 400 64px/1.2 "Playfair Display",serif;max-width:900px}
      .T{right:130px;top:300px;text-align:right}.T h1{font:400 150px/1 "Playfair Display",serif}.T h1 i{color:#e9c690}
      .T p{margin-top:26px;font:italic 400 34px "Playfair Display",serif;opacity:.9}.T small{display:block;margin-top:34px;font-size:16px;letter-spacing:.34em;text-transform:uppercase;color:#e9c690}`;document.head.appendChild(css);
    R.show(tl,R.el(g,'k sh','Maison Orvèle · Concept'),.5,7.3,{y:-10});
    R.type(tl,R.el(g,'w sh','Hổ phách tan trong thủy tinh,'),.6,2.2,{stagger:.028});
    R.type(tl,R.el(g,'w sh','một giọt lơ lửng lúc nửa đêm.'),2.6,4.4,{stagger:.028});
    const T=R.el(g,'T sh','<h1 class="a">Ambre</h1><h1 class="b"><i>Minuit</i></h1><p>Hổ phách lúc nửa đêm</p><small>Eau de parfum · 61,8 ml</small>');gsap.set(T,{autoAlpha:0});tl.set(T,{autoAlpha:1},5);
    const a=R.split(T.querySelector('.a')),b=R.split(T.querySelector('.b i'));
    tl.from(a,{autoAlpha:0,y:40,filter:'blur(8px)',stagger:.06,duration:.7,ease:'power3.out'},5).from(b,{autoAlpha:0,y:40,filter:'blur(8px)',stagger:.06,duration:.7,ease:'power3.out'},5.4)
      .from(T.querySelector('p'),{autoAlpha:0,y:16,duration:.6},6).from(T.querySelector('small'),{autoAlpha:0,duration:.6},6.3).to(T,{autoAlpha:0,duration:.5},7.4);
  }});
