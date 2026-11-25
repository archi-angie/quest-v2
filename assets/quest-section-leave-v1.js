(() => {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:700px)');
  const selectors=['.hotels','.offers','.news-stage','.reels-section','footer.footer'];
  const sections=new Set();
  let pending=false;
  let observer;
  const scan=()=>{
    selectors.forEach(selector=>{
      const section=document.querySelector(selector);
      if(section&&!sections.has(section)){
        sections.add(section);
        observer?.observe(section);
      }
    });
    schedule();
  };
  const clear=section=>{
    section.style.removeProperty('--quest-section-leave-shift');
    section.style.removeProperty('--quest-section-leave-opacity');
    section.style.removeProperty('--quest-section-pattern-shift');
  };
  const update=()=>{
    pending=false;
    if(reduce.matches){sections.forEach(clear);return}
    const height=innerHeight;
    sections.forEach(section=>{
      if(!section.isConnected){sections.delete(section);return}
      const rect=section.getBoundingClientRect();
      const progress=Math.max(0,Math.min(1,(height*.55-rect.bottom)/(height*.28)));
      const distance=mobile.matches?8:18;
      section.style.setProperty('--quest-section-leave-shift',(-progress*distance).toFixed(1)+'px');
      section.style.setProperty('--quest-section-pattern-shift',(-progress*(mobile.matches?4:10)).toFixed(1)+'px');
      section.style.setProperty('--quest-section-leave-opacity',(1-progress*.16).toFixed(3));
    });
  };
  function schedule(){if(!pending){pending=true;requestAnimationFrame(update)}}
  const init=()=>{
    if('ResizeObserver' in window)observer=new ResizeObserver(schedule);
    scan();
    const app=document.getElementById('app')||document.body;
    const mutations=new MutationObserver(scan);
    mutations.observe(app,{childList:true,subtree:true});
    addEventListener('scroll',schedule,{passive:true});
    addEventListener('resize',schedule,{passive:true});
    addEventListener('pageshow',schedule);
    addEventListener('load',schedule,true);
    document.fonts?.ready.then(schedule).catch(()=>{});
    reduce.addEventListener?.('change',schedule);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();