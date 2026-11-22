/* Calvente — Đi chậm. Đến xa. · kinetic typography 9:16, 7 giây. Ảnh và cảnh quay thật ở xưởng giày (Pexels); chữ lớn cắt theo nhịp, số mũi khâu đếm lên. */
R3.film({W:1080,H:1920,dur:7,poster:1.0,cover:[1.0,3.6,6.3],
  grade:{filter:'contrast(1.16) saturate(.85) brightness(.82)',tint:['#1a0d08','#ffd8a8'],tintA:.5,vig:.55,grain:.08},
  shots:[
    {photo:'p1',in:0,out:1.4,focus:[.5,.4],cam:[[0,0,0,1.2],[1,0,0,1.08]],ease:'out'},
    {photo:'p2',in:1.4,out:2.7,focus:[.5,.5],cam:[[0,0,0,1.05],[1,0,0,1.18]],ease:'out',tr:{type:'flash',d:.16,a:.5}},
    {clip:'a',in:2.7,out:4.2,cam:[[0,0,0,1.0],[1,0,0,1.06]],tr:{type:'whip',d:.2}},
    {photo:'p5',in:4.2,out:5.5,focus:[.5,.6],cam:[[0,0,0,1.2],[1,0,0,1.06]],ease:'out',tr:{type:'flash',d:.16,a:.5}},
    {photo:'p3',in:5.5,out:7,focus:[.5,.5],cam:[[0,0,0,1.04],[1,0,0,1.14]],ease:'out',tr:{type:'fade',d:.3}}],
  build(tl,g,R){
    const css=document.createElement('style');css.textContent=`
      .hd{left:64px;right:64px;top:80px;display:flex;justify-content:space-between;font-size:20px;letter-spacing:.36em;text-transform:uppercase}
      .X{left:56px;right:56px;font:600 250px/.92 "Be Vietnam Pro";text-transform:uppercase;letter-spacing:-.02em}.X.s{font:italic 400 220px/1 "Playfair Display",serif;text-transform:none;color:#f0c690}
      .n{left:56px;top:560px;font:600 420px/.9 "Be Vietnam Pro";color:#f0c690}.nl{left:64px;top:980px;font:500 54px "Be Vietnam Pro"}
      .ft{left:64px;right:64px;bottom:120px;font-size:22px;letter-spacing:.3em;text-transform:uppercase;display:flex;justify-content:space-between}
      .end{inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(14,8,5,.45)}.end h1{font:600 150px/1 "Be Vietnam Pro";letter-spacing:.06em;text-transform:uppercase}.end p{margin-top:26px;font:italic 400 60px "Playfair Display",serif;color:#f0c690}`;document.head.appendChild(css);
    R.show(tl,R.el(g,'hd sh','<span>Calvente</span><span>Concept</span>'),.15,5.6,{y:-8});
    R.show(tl,R.el(g,'ft sh','<span>Giày thủ công</span><span>Từ 01 đôi</span>'),.15,5.6);
    const A=R.el(g,'X sh','Đi','top:520px'),B=R.el(g,'X s sh','chậm.','top:780px');R.show(tl,A,.15,1.4,{y:120},{d:.4,ease:'power4.out',dOut:.12});R.type(tl,B,.45,1.4,{stagger:.09,dOut:.12});
    const C=R.el(g,'X sh','Đến','top:520px'),Dd=R.el(g,'X s sh','xa.','top:780px');R.show(tl,C,1.5,2.7,{y:120},{d:.4,ease:'power4.out',dOut:.12});R.show(tl,Dd,1.8,2.7,{x:-260,filter:'blur(18px)'},{d:.5,ease:'power4.out',dOut:.12});
    const n=R.el(g,'n sh','0'),nl=R.el(g,'nl sh','mũi khâu tay · mỗi chiếc');R.show(tl,n,2.85,4.2,{y:60},{dOut:.12});R.show(tl,nl,3.0,4.2,{y:20},{dOut:.12});R.count(tl,n,0,212,2.9,1.0);
    const E=R.el(g,'X sh','Một','top:520px'),F=R.el(g,'X s sh','nghề.','top:780px');R.show(tl,E,4.3,5.5,{y:120},{d:.4,ease:'power4.out',dOut:.12});R.type(tl,F,4.6,5.5,{stagger:.07,dOut:.12});
    const e=R.el(g,'end sh','<h1>Calvente</h1><p>Đi chậm. Đến xa.</p>');R.show(tl,e,5.75,null,{},{d:.4});tl.from(e.children,{y:40,autoAlpha:0,stagger:.14,duration:.55,ease:'power3.out'},5.8);
  }});
