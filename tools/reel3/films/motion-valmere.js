/* Valmère — logo animation 1:1, 7 giây. Cận cảnh bộ máy đồng hồ thật đang chạy (Pexels); vòng logo tự vẽ, chữ V hiện bằng nét, chữ thương hiệu có vệt sáng lướt. */
R3.film({W:1080,H:1080,dur:7,poster:5.2,cover:[1.6,5.2],
  grade:{filter:'contrast(1.14) saturate(.9) brightness(.9)',tint:['#0a1220','#ffe2b0'],tintA:.45,vig:.6,grain:.06,fade:[.4,.5]},
  shots:[
    {clip:'b',in:0,out:2.4,cam:[[0,0,0,1.25],[1,0,0,1.05]],ease:'lin'},
    {clip:'a',in:2.4,out:7,rate:.6,cam:[[0,0,0,1.0],[1,0,0,1.18]],ease:'lin',filter:'contrast(1.1) saturate(.8) brightness(.5) blur(3px)',tr:{type:'fade',d:.9}}],
  build(tl,g,R){
    const css=document.createElement('style');css.textContent=`
      .k{left:0;right:0;top:70px;text-align:center;font-size:17px;letter-spacing:.44em;text-transform:uppercase;color:#e8cf9f}
      .lg{left:340px;top:230px;width:400px;height:400px}.lg svg{width:100%;height:100%;overflow:visible}
      .nm{left:0;right:0;top:680px;text-align:center;font:500 104px/1 "Playfair Display",serif;letter-spacing:.24em;text-indent:.24em;text-transform:uppercase;background:linear-gradient(100deg,#f3e3c2 40%,#fff 50%,#f3e3c2 60%);background-size:300% 100%;-webkit-background-clip:text;color:transparent}
      .sb{left:0;right:0;top:820px;text-align:center;font-size:19px;letter-spacing:.5em;text-transform:uppercase;color:#e8cf9f}
      .q{left:90px;right:90px;bottom:150px;text-align:center;font:italic 400 52px/1.25 "Playfair Display",serif}`;document.head.appendChild(css);
    R.show(tl,R.el(g,'k sh','Manufacture horlogère · Concept'),.5,6.4,{y:-8});
    R.type(tl,R.el(g,'q sh','Mỗi nhịp là một lời hứa.'),.6,2.4,{stagger:.035});
    const lg=R.el(g,'lg','<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" fill="none" stroke="#e8cf9f" stroke-width="1.6" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 100 100)"/><circle class="c2" cx="100" cy="100" r="84" fill="none" stroke="#e8cf9f" stroke-width=".6" opacity=".6"/><path d="M62 62 L100 142 L138 62" fill="none" stroke="#f6ead2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>'+Array.from({length:12},(_,i)=>`<line class="tk" x1="100" y1="12" x2="100" y2="${i%3?17:21}" stroke="#e8cf9f" stroke-width="1.2" transform="rotate(${i*30} 100 100)"/>`).join('')+'</svg>');
    tl.to(lg.querySelector('circle'),{strokeDashoffset:0,duration:1.3,ease:'power2.inOut'},2.7).from(lg.querySelectorAll('.tk'),{autoAlpha:0,stagger:.04,duration:.3},3.0)
      .from(lg.querySelector('.c2'),{autoAlpha:0,scale:.8,transformOrigin:'50% 50%',duration:.8},3.2).to(lg.querySelector('path'),{strokeDashoffset:0,duration:.9,ease:'power3.out'},3.6);
    const nm=R.el(g,'nm','Valmère');gsap.set(nm,{autoAlpha:0});tl.fromTo(nm,{autoAlpha:0,letterSpacing:'.5em'},{autoAlpha:1,letterSpacing:'.24em',duration:1,ease:'power3.out'},4.2).fromTo(nm,{backgroundPosition:'100% 0'},{backgroundPosition:'0% 0',duration:1.4,ease:'power1.inOut'},4.9);
    R.show(tl,R.el(g,'sb','Est. concept · Genève'),5.0,null,{y:12});
  }});
