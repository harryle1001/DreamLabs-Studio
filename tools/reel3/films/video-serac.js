/* Maison Sérac — Đêm ra mắt · recap sự kiện 16:9, 8 giây. Cảnh quay thật (Pexels); dựng: cắt theo nhịp, flash, slow-motion khoảnh khắc chạm ly và pháo giấy, lower-third theo mốc giờ, grade xanh – vàng, logo kết. */
R3.film({W:1920,H:1080,dur:8,poster:2.9,
  grade:{filter:'contrast(1.16) saturate(1.2) brightness(.97)',tint:['#0a1e3a','#ffcf7a'],tintA:.46,vig:.45,grain:.07},
  shots:[
    {clip:'a',in:0,out:1.0,cam:[[0,0,0,1.02],[1,0,0,1.07]]},
    {clip:'b',in:1.0,out:2.0,cam:[[0,0,0,1.06],[1,0,0,1.02]],tr:{type:'flash',d:.18,a:.6}},
    {clip:'c',in:2.0,out:3.4,rate:.5,cam:[[0,0,0,1.02],[1,0,0,1.08]],tr:{type:'flash',d:.18,a:.6}},
    {clip:'d',in:3.4,out:4.2,cam:[[0,0,0,1.04],[1,0,0,1.0]],tr:{type:'whip',d:.2}},
    {clip:'e',in:4.2,out:5.8,rate:.5,cam:[[0,0,0,1.0],[1,0,0,1.07]],tr:{type:'flash',d:.22,a:.8}},
    {clip:'g',in:5.8,out:6.7,cam:[[0,0,0,1.04],[1,0,0,1.0]],tr:{type:'flash',d:.18,a:.6}},
    {clip:'f',in:6.7,out:8,rate:.6,cam:[[0,0,0,1.0],[1,0,0,1.06]],tr:{type:'fade',d:.3}}],
  build(tl,g,R){
    const css=document.createElement('style');css.textContent=`
      .hd{left:80px;right:80px;top:120px;display:flex;justify-content:space-between;font-size:17px;letter-spacing:.34em;text-transform:uppercase}
      .l3{left:80px;bottom:150px;font:italic 400 58px/1.1 "Playfair Display",serif}.l3 small{font:500 20px "Be Vietnam Pro";font-style:normal;color:#f4d59a}
      .end{inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(6,12,26,.5)}
      .end h1{font:500 140px/1 "Playfair Display",serif;letter-spacing:.22em;text-transform:uppercase}.end small{font-size:20px;letter-spacing:.5em;text-transform:uppercase;color:#f4d59a;margin-bottom:22px}.end p{margin-top:26px;font:italic 400 40px "Playfair Display",serif}`;document.head.appendChild(css);
    R.letterbox(84);
    R.show(tl,R.el(g,'hd sh','<span>Maison Sérac</span><span>Đêm ra mắt · Concept</span>'),.2,6.6,{y:-10});
    [[.2,1.95,'19:30','Ly đã sẵn trên quầy'],[2.1,3.35,'20:15','Chạm ly'],[3.5,4.15,'20:40','Quầy bar kín chỗ'],[4.35,5.75,'21:00','Pháo giấy bung'],[5.9,6.65,'22:10','Và một đêm để nhớ']].forEach(([a,b,h,t])=>R.show(tl,R.el(g,'l3 sh','<small>'+h+'</small><span>'+t+'</span>'),a,b,{x:-36},{d:.35,dOut:.16}));
    const e=R.el(g,'end sh','<small>Maison</small><h1>Sérac</h1><p>Cảm ơn đã đến.</p>');R.show(tl,e,6.85,null,{},{d:.45});tl.from(e.children,{y:30,autoAlpha:0,stagger:.13,duration:.55,ease:'power3.out'},6.9);
  }});
