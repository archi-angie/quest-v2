(() => {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:700px)');
  const selectors=['.hotels','.offers','.news-stage','.reels-section','.membership-redesign','footer.footer'];
  const tracks=new Map();
  let pending=false;
  let measuring=false;
  let sizeObserver;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const headerHeight=()=>document.querySelector('.header')?.getBoundingClientRect().height||0;
  const update=()=>{
    pending=false;
    if(measuring)return;
    measuring=true;
    const nav=headerHeight();
    let scrollCorrection=0;
    for(const [section,track] of tracks){
      if(!section.isConnected||!track.isConnected){tracks.delete(section);continue}
      const h=section.getBoundingClientRect().height;
      const fits=h<=innerHeight-nav-12;
      const hold=reduce.matches?0:mobile.matches?(fits?Math.min(76,innerHeight*.1):Math.min(42,innerHeight*.06)):(fits?Math.min(155,innerHeight*.18):Math.min(78,innerHeight*.09));
      const old=parseFloat(track.dataset.hold||'0');
      const nextHeight=h+hold;
      if(Math.abs((parseFloat(track.style.height)||0)-nextHeight)>.5){
        if(track.getBoundingClientRect().bottom<nav+2)scrollCorrection+=hold-old;
        track.style.height=nextHeight.toFixed(1)+'px';
        track.dataset.hold=String(hold);
      }
      track.style.setProperty('--quest-pin-top',nav.toFixed(1)+'px');
      const rect=track.getBoundingClientRect();
      const progress=hold?clamp((nav-rect.top)/hold):0;
      const lift=reduce.matches?0:-Math.sin(progress*Math.PI)*(mobile.matches?5:10);
      const approach=reduce.matches?1:clamp((innerHeight*.9-rect.top)/(innerHeight*.35));
      const enterLift=reduce.matches?0:(1-approach)*(mobile.matches?8:14);
      track.style.setProperty('--quest-pin-lift',lift.toFixed(1)+'px');
      track.style.setProperty('--quest-pin-enter-lift',enterLift.toFixed(1)+'px');
    }
    measuring=false;
    if(scrollCorrection&&scrollY>0)scrollBy(0,scrollCorrection);
  };
  const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(update)}};
  const install=()=>{
    if(reduce.matches)return;
    const anchor=[...tracks.keys()].find(s=>{const r=s.getBoundingClientRect();return r.top<=innerHeight*.5&&r.bottom>=innerHeight*.5});
    const before=anchor?.getBoundingClientRect().top;
    let added=false;
    selectors.forEach(selector=>{
      const section=document.querySelector(selector);
      if(!section||tracks.has(section))return;
      const parent=section.parentElement;
      if(!parent)return;
      const track=document.createElement('div');
      track.className='quest-pin-track';
      parent.insertBefore(track,section);
      track.append(section);
      section.classList.add('quest-pin-target');
      tracks.set(section,track);
      sizeObserver?.observe(section);
      added=true;
    });
    if(added){
      update();
      if(anchor&&Number.isFinite(before)){
        const delta=anchor.getBoundingClientRect().top-before;
        if(Math.abs(delta)>1)scrollBy(0,delta);
      }
    }
  };
  const disable=()=>{
    for(const [section,track] of tracks){
      if(track.isConnected&&section.isConnected){
        track.parentElement.insertBefore(section,track);
        track.remove();
        section.classList.remove('quest-pin-target');
      }
      sizeObserver?.unobserve(section);
    }
    tracks.clear();
  };
  const init=()=>{
    if('ResizeObserver' in window)sizeObserver=new ResizeObserver(schedule);
    install();
    const app=document.getElementById('app')||document.body;
    const mutations=new MutationObserver(install);
    mutations.observe(app,{childList:true,subtree:true});
    addEventListener('scroll',schedule,{passive:true});
    addEventListener('resize',schedule,{passive:true});
    addEventListener('pageshow',schedule);
    addEventListener('load',schedule,true);
    document.fonts?.ready.then(schedule).catch(()=>{});
    reduce.addEventListener?.('change',()=>{if(reduce.matches)disable();else install();schedule()});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();