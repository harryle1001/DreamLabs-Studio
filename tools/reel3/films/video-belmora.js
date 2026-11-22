/* Belmora — Sienna · TVC 16:9 túi da, 8 giây. Cảnh quay thật ở xưởng da (Pexels); dựng: cắt theo nhịp, whip-pan, letterbox, grade ấm nắng chiều, tiêu đề từng chữ, thẻ kết. */
R3.film({W:1920,H:1080,dur:8,poster:5.1,
  grade:{filter:'contrast(1.12) saturate(1.16) sepia(.12) brightness(.98)',tint:['#3a1808','#ffd9a0'],tintA:.42,vig:.42,grain:.06},
  shots:[
    {clip:'a',in:0,out:1.3,cam:[[0,0,0,1.02],[1,.01,0,1.08]]},
    {clip:'b',in:1.3,out:2.4,cam:[[0,0,0,1.1],[1,0,0,1.02]]},
    {clip:'c',in:2.4,out:3.6,cam:[[0,.02,0,1.04],[1,0,0,1.1]],tr:{type:'flash',d:.22,color:'#ffe2b8',a:.6}},
    {clip:'d',in:3.6,out:4.6,cam:[[0,0,0,1.02],[1,-.01,0,1.07]]},
    {clip:'e',in:4.6,out:5.6,cam:[[0,0,0,1.08],[1,0,0,1.02]]},
    {clip:'f',in:5.6,out:6.6,cam:[[0,0,0,1.02],[1,0,0,1.1]],tr:{type:'whip',d:.24}},
    {clip:'g',in:6.6,out:8,rate:.8,cam:[[0,0,0,1.04],[1,0,0,1.0]],tr:{type:'fade',d:.35}}],
  build(tl,g,R){
    const css=document.createElement('style');css.textContent=`
      .top{left:96px;right:96px;top:128px;display:flex;justify-content:space-between;font-size:17px;letter-spacing:.34em;text-transform:uppercase}
      .ttl{left:96px;bottom:176px;font:500 92px/1.05 "Playfair Display",serif}.ttl em{color:#f0cf9c;font-style:italic}
      .l3{left:96px;bottom:176px;font:500 34px/1.2 "Be Vietnam Pro"}
      .end{inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(18,8,3,.5)}
      .end h1{font:500 150px/1 "Playfair Display",serif;letter-spacing:.14em;text-transform:uppercase}.end p{margin-top:30px;font-size:22px;letter-spacing:.42em;text-transform:uppercase;color:#f0cf9c}.end .rule{width:220px;margin-top:34px;color:#f0cf9c}`;document.head.appendChild(css);
    R.letterbox(96);
    R.show(tl,R.el(g,'top sh','<span>Belmora</span><span>Sienna · Thu Đông · Concept</span>'),.3,6.5,{y:-10});
    [[.3,1.25,'Da bê thuộc thảo mộc','01 — Chọn da'],[1.4,2.35,'Cắt tay từng tấm','02 — Cắt'],[2.5,3.55,'Khâu yên ngựa, chỉ sáp','03 — Khâu'],[3.7,4.55,'Miết cạnh ba lớp','04 — Hoàn thiện'],[4.7,5.55,'Khóa đồng đúc','05 — Phụ kiện']].forEach(([a,b,t,k])=>{
      const e=R.el(g,'l3 sh','<small>'+k+'</small><span>'+t+'</span>');R.show(tl,e,a,b,{x:-30},{d:.35,dOut:.18})});
    const t=R.el(g,'ttl sh','Sienna, <em>làm bằng tay.</em>');R.type(tl,t,5.75,6.6,{stagger:.035});
    const e=R.el(g,'end sh','<h1>Belmora</h1><div class="rule"></div><p>Sienna · Mở đặt trước</p>');R.show(tl,e,6.85,null,{},{d:.5});
    tl.from(e.querySelector('h1'),{letterSpacing:'.5em',autoAlpha:0,duration:.9,ease:'power3.out'},6.9).from(e.querySelector('.rule'),{scaleX:0,transformOrigin:'50% 50%',duration:.6},7.1).from(e.querySelector('p'),{y:16,autoAlpha:0,duration:.5},7.2);
  }});
