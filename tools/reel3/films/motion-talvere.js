/* Talvère — Arc 28 · phim ra mắt túi cho Reels/TikTok 9:16, 8 giây. Cảnh quay và ảnh chụp thật (Pexels); chữ động, số lớn, ngày mở bán. */
R3.film({W:1080,H:1920,dur:8,poster:2.2,cover:[2.2,4.3,7.2],
  grade:{filter:'contrast(1.06) saturate(1.1)',tint:['#3a1c08','#fff0dc'],tintA:.25,vig:.25,grain:.05},
  shots:[
    {clip:'a',in:0,out:1.9,cam:[[0,0,0,1.0],[1,0,-.01,1.08]]},
    {clip:'b',in:1.9,out:3.7,cam:[[0,0,0,1.08],[1,0,0,1.0]],tr:{type:'whip',d:.26}},
    {clip:'c',in:3.7,out:5.4,cam:[[0,0,0,1.0],[1,0,0,1.07]],tr:{type:'flash',d:.24,color:'#fff3e0'}},
    {photo:'p2',in:5.4,out:8,focus:[.5,.55],cam:[[0,0,.02,1.18],[1,0,0,1.04]],ease:'out',tr:{type:'fade',d:.45}}],
  build(tl,g,R){
    const css=document.createElement('style');css.textContent=`
      .hd{left:70px;right:70px;top:84px;display:flex;justify-content:space-between;font-size:20px;letter-spacing:.36em;text-transform:uppercase;color:#2a1a10}
      .big{left:70px;top:190px;font:400 250px/.9 "Playfair Display",serif;color:#2a1a10}.big i{color:#b4541a}
      .ln{left:70px;bottom:210px;font:500 46px/1.25 "Be Vietnam Pro";color:#2a1a10;max-width:860px}.ln small{display:block;font-size:20px;letter-spacing:.3em;text-transform:uppercase;margin-bottom:14px;color:#b4541a}
      .end{inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:250px;color:#fff}
      .end small{font-size:22px;letter-spacing:.5em;text-transform:uppercase;color:#f0b98a}.end h1{font:400 230px/1 "Playfair Display",serif;margin-top:20px}.end h1 i{color:#f0b98a}
      .end p{position:absolute;bottom:230px;font-size:24px;letter-spacing:.34em;text-transform:uppercase}.end .pill{position:absolute;bottom:130px;font-size:22px;color:#f0b98a}`;document.head.appendChild(css);
    R.show(tl,R.el(g,'hd','<span>Talvère</span><span>Concept</span>'),.2,5.4,{y:-10});
    [[.3,1.85,'Arc','Một đường cong','Quai vòm liền thân'],[2.1,3.65,'<i>28</i>','Hai mươi tám phân','Vừa một ngày bận rộn'],[3.9,5.35,'Cam','Da bê nhuộm thủ công','Sắc cam đất nung']].forEach(([a,b,w,k,t])=>{
      const e=R.el(g,'big',w);R.show(tl,e,a,b,{y:80},{d:.6,ease:'power4.out'});R.show(tl,R.el(g,'ln','<small>'+k+'</small>'+t),a+.15,b,{y:30})});
    const e=R.el(g,'end sh','<small>Talvère</small><h1>Arc <i>28</i></h1><p>Mở bán 08 · 12</p><div class="pill">Đặt trước từ hôm nay</div>');R.show(tl,e,5.7,null,{},{d:.5});tl.from(e.children,{y:40,autoAlpha:0,stagger:.13,duration:.6,ease:'power3.out'},5.75);
  }});
