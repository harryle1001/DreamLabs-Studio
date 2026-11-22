/* Halden — Unboxing Réserve 39 · video vuông 1:1, 7,5 giây. Cảnh quay thật (Pexels); dựng: speed ramp mở hộp, cận cảnh mặt số và dây da, phụ đề động, thanh bốn bước, flash theo nhịp, thẻ kết. */
R3.film({W:1080,H:1080,dur:7.5,poster:3.4,cover:[3.4,5.2],
  grade:{filter:'contrast(1.12) saturate(1.1) brightness(.98)',tint:['#0e1a2a','#ffe0b4'],tintA:.4,vig:.45,grain:.06},
  shots:[
    {clip:'a',in:0,out:1.6,seq:{t:[[0,0],[.6,1.3],[1.6,1.8]],blend:true},cam:[[0,0,0,1.0],[1,0,0,1.08]]},
    {clip:'b',in:1.6,out:2.9,cam:[[0,0,0,1.0],[1,0,0,1.08]],tr:{type:'flash',d:.24,color:'#fff1d8'}},
    {clip:'c',in:2.9,out:4.2,cam:[[0,0,0,1.06],[1,0,0,1.0]],tr:{type:'flash',d:.2,color:'#fff1d8',a:.6}},
    {clip:'d',in:4.2,out:5.1,cam:[[0,0,0,1.0],[1,0,0,1.06]],tr:{type:'zoom',d:.26}},
    {clip:'e',in:5.1,out:6.2,cam:[[0,0,0,1.04],[1,0,0,1.0]],tr:{type:'flash',d:.2,color:'#fff1d8',a:.6}},
    {clip:'f',in:6.2,out:7.5,rate:.7,cam:[[0,0,0,1.0],[1,0,0,1.05]],tr:{type:'fade',d:.3}}],
  build(tl,g,R){
    const css=document.createElement('style');css.textContent=`
      .hd{left:56px;right:56px;top:52px;display:flex;justify-content:space-between;font-size:18px;letter-spacing:.32em;text-transform:uppercase}
      .st{left:56px;right:56px;bottom:56px;display:flex;gap:10px}.st div{flex:1;font-size:15px;letter-spacing:.2em;text-transform:uppercase;opacity:.45;padding-top:12px;border-top:3px solid rgba(255,255,255,.3);position:relative}
      .st div u{position:absolute;left:0;right:0;top:-3px;height:3px;background:#f1d6a4;transform-origin:0 50%;transform:scaleX(0)}
      .caps{top:820px;height:120px}.cap{font-size:50px}
      .end{inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(8,12,20,.55)}
      .end h1{font:500 120px/1 "Playfair Display",serif;letter-spacing:.2em;text-transform:uppercase}.end h2{font:italic 400 46px "Playfair Display",serif;color:#f1d6a4;margin-top:14px}.end p{margin-top:28px;font-size:18px;letter-spacing:.4em;text-transform:uppercase}`;document.head.appendChild(css);
    R.show(tl,R.el(g,'hd sh','<span>Halden</span><span>Unboxing · Concept</span>'),.2,6.4,{y:-10});
    const st=R.el(g,'st sh',['Mở hộp','Lên tay','Mặt số','Dây da'].map(x=>'<div><u></u>'+x+'</div>').join(''));R.show(tl,st,.2,6.3);
    [[0,1.6],[1.6,2.9],[2.9,5.1],[5.1,6.2]].forEach(([a,b],i)=>{tl.fromTo(st.children[i].firstChild,{scaleX:0},{scaleX:1,duration:b-a,ease:'none'},a).to(st.children[i],{opacity:1,duration:.2},a)});
    R.subs(tl,R.el(g,'caps'),[[.3,1.5,'Hộp gỗ *mở* *chậm*'],[1.75,2.85,'lên tay, *vừa* *vặn*'],[3.0,4.15,'kim giây *lướt* êm'],[4.3,5.05,'bộ máy *lộ* *cơ*'],[5.2,6.15,'dây da *khâu* *tay*']],{step:.14});
    const e=R.el(g,'end sh','<h1>Halden</h1><h2>Réserve 39</h2><p>Bản giới hạn · đánh số từng chiếc</p>');R.show(tl,e,6.45,null,{},{d:.45});tl.from(e.children,{y:30,autoAlpha:0,stagger:.12,duration:.55,ease:'power3.out'},6.5);
  }});
