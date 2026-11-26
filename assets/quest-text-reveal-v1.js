(() => {
  // Animate rendered text only. Never wrap letters: the approved headline CSS
  // targets descendant spans, so added spans would change its layout.
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:700px)');
  const sections=['.hero','.hotels','.offers','.news-stage','.reels-section','.membership-redesign','footer.footer'];
  const targets='h1,h2,h3,h4,p,li,small,label,button,a,.headline-first,.headline-highlight>span,.headline-stage h1 strong,#offers-title>span,#offers-title>strong,.membership-banner-text,.membership-big,.news-stage-heading-mobile';
  const revealed=new WeakSet(), active=new Set(), loops=new Map();
  const run=(node,frames,options)=>{
    try{const motion=node.animate(frames,options);motion.finished.catch(()=>{});return motion}catch(_){return null}
  };
  const visible=node=>{
    if(!node.getClientRects().length)return false;
    const style=getComputedStyle(node);
    return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity)>0;
  };
  const copyNodes=section=>[...section.querySelectorAll(targets)].filter(node=>{
    if(!visible(node)||node.closest('.sr-only,.social-ribbon,.reels-track,.hero-gallery,.mobile-menu,.booking-panel,.qb-panel'))return false;
    if(node.matches('h1,h2,h3,h4')&&node.querySelector('span,strong,svg'))return false;
    if(node.querySelector('h1,h2,h3,h4,p,li,small,label,button,a'))return false;
    return node.textContent.trim().length>0;
  });
  const heading=node=>node.matches('h1,h2,h3,h4,.headline-first,.headline-highlight>span,.headline-stage h1 strong,#offers-title>span,#offers-title>strong,.membership-banner-text,.membership-big,.news-stage-heading-mobile');
  const reveal=section=>{
    if(reduced.matches)return;
    const nodes=copyNodes(section);
    let order=0;
    nodes.forEach(node=>{
      if(revealed.has(node))return;
      revealed.add(node);
      const title=heading(node);
      const delay=Math.min(order++*50,600);
      const duration=title?Math.min(1250,560+node.textContent.trim().length*27):520;
      // clip-path, opacity and blur change paint only; text size and line breaks stay untouched.
      const frames=title?[
        {clipPath:'inset(0 100% 0 0)',opacity:.42,filter:'blur(3px)'},
        {clipPath:'inset(0 0 0 0)',opacity:1,filter:'blur(0)'}
      ]:[
        {opacity:.5,filter:'blur(3px)'},
        {opacity:1,filter:'blur(0)'}
      ];
      run(node,frames,{duration,delay,easing:title?'cubic-bezier(.16,1,.3,1)':'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
      if(title&&matchMedia('(hover:hover) and (pointer:fine)').matches){
        node.addEventListener('pointerenter',()=>{
          if(reduced.matches)return;
          run(node,[
            {filter:'blur(0)',offset:0},
            {filter:'blur(1.2px)',offset:.45},
            {filter:'blur(0)',offset:1}
          ],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'});
        },{passive:true});
      }
    });
  };
  const idle=section=>{
    clearTimeout(loops.get(section));
    if(!active.has(section)||reduced.matches||document.hidden)return;
    loops.set(section,setTimeout(()=>{
      if(!active.has(section)||reduced.matches||document.hidden)return;
      const titles=copyNodes(section).filter(heading).slice(0,3);
      titles.forEach((node,index)=>run(node,[
        {filter:'blur(0)',opacity:1,offset:0},
        {filter:'blur(1.5px)',opacity:.78,offset:.42},
        {filter:'blur(0)',opacity:1,offset:1}
      ],{duration:520,delay:index*50,easing:'cubic-bezier(.22,1,.36,1)'}));
      idle(section);
    },8500));
  };
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const section=entry.target;
      if(entry.isIntersecting){
        active.add(section);
        if(section.matches('.hero')&&document.documentElement.classList.contains('quest-splash-pending'))return;
        reveal(section);idle(section);
      }else{
        active.delete(section);clearTimeout(loops.get(section));loops.delete(section);
      }
    });
  },{rootMargin:'0px 0px -7% 0px',threshold:.02}):null;
  const init=()=>{
    sections.forEach(selector=>{
      const section=document.querySelector(selector);
      if(!section)return;
      if(observer)observer.observe(section);else{active.add(section);reveal(section);idle(section)}
    });
    const hero=document.querySelector('.hero');
    if(hero&&document.documentElement.classList.contains('quest-splash-pending')){
      const splash=new MutationObserver(()=>{
        if(!document.documentElement.classList.contains('quest-splash-pending')){
          if(active.has(hero)){reveal(hero);idle(hero)}
          splash.disconnect();
        }
      });
      splash.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    }
    document.addEventListener('visibilitychange',()=>{
      sections.forEach(selector=>{
        const section=document.querySelector(selector);
        if(!section)return;
        if(document.hidden){clearTimeout(loops.get(section));loops.delete(section)}
        else if(active.has(section))idle(section);
      });
    });
    reduced.addEventListener?.('change',()=>{
      if(reduced.matches){loops.forEach(clearTimeout);loops.clear()}
      else active.forEach(section=>idle(section));
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();