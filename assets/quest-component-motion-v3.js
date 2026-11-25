(() => {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:700px)');
  const root=document.documentElement;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
  const tracked=new Map();
  const near=new Set();
  let queued=false;
  const groups=[
    ['.hero',[['.headline-stage',1],['.hero-gallery',1],['.booking-shell',1],['.booking label',.35],['.booking-submit',.4]]],
    ['.hotels',[['.hotels-title-tab',1],['.destination-column',.8],['.destination-row',.3],['.destination-page-dot',.35],['.hotel-stage',1],['.stacked-hotel-card.active',.35],['.carousel-controls',.35],['.hotel-details',1]]],
    ['.offers',[['.offers-intro',1],['.offer-ticket',1],['.offer-thumbnail-wrap',.32],['.offer-ticket-copy',.32],['.offer-learn',.35],['.offer-page-bubble',.35]]],
    ['.news-stage',[['.news-stage-oval',.5],['.news-stage-heading',1],['.news-stage-preview',.75],['.news-stage-featured-image',1],['.news-stage-featured h3',.6],['.news-stage-featured>p:not(.news-stage-detail-note)',.5],['.news-stage-action',.5],['.news-stage-control',.35]]],
    ['.reels-section',[['.reels-phone-heading',1],['.reels-pattern-block',.5],['.reels-phone-slot',1],['.reels-phone',1],['.reels-phone-dots',.55]]],
    ['.membership-redesign',[['.membership-headline-left',1],['.membership-headline-right',1],['.membership-headline-mobile',1],['.membership-visual',.85],['.membership-stores a',.5]]],
    ['.footer',[['.qf-cta-content',1],['.qf-logo-social',.7],['.qf-main-grid nav',.7],['.qf-awards',.7],['.qf-bottom',.6],['.qf-brands-viewport',.55]]],
    ['.social-ribbon',[['.social-ribbon__slope',.4]]]
  ];
  const update=()=>{
    queued=false;
    if(reduce.matches)return;
    const height=innerHeight;
    const nav=document.querySelector('.header')?.getBoundingClientRect().height||80;
    const entry=Math.min(height*.24,mobile.matches?110:180);
    const leave=Math.min(height*.2,mobile.matches?90:145);
    for(const node of near){
      if(!node.isConnected){near.delete(node);tracked.delete(node);continue}
      const rect=node.getBoundingClientRect();
      const inProgress=clamp((height-rect.top)/entry);
      const outProgress=clamp((rect.bottom-nav)/leave);
      const factor=tracked.get(node)?.factor||1;
      const distance=(mobile.matches?8:14)*factor;
      const shift=((1-smooth(inProgress))-(1-smooth(outProgress)))*distance;
      const previous=tracked.get(node);
      if(!previous || Math.abs((previous.last??100)-shift)>.12){
        node.style.translate='0px '+shift.toFixed(2)+'px';
        if(previous)previous.last=shift;
      }
    }
  };
  const request=()=>{if(!queued){queued=true;requestAnimationFrame(update)}};
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.isIntersecting)near.add(entry.target);
      else near.delete(entry.target);
    }
    request();
  },{rootMargin:'180px 0px 180px 0px',threshold:0}):null;
  const scan=()=>{
    for(const [sectionSelector,items] of groups){
      const section=document.querySelector(sectionSelector);
      if(!section)continue;
      for(const [selector,factor] of items){
        for(const node of section.querySelectorAll(selector)){
          if(tracked.has(node))continue;
          tracked.set(node,{factor,original:node.style.translate,last:null});
          if(observer)observer.observe(node);else near.add(node);
        }
      }
    }
    for(const node of tracked.keys()){
      if(!node.isConnected){observer?.unobserve(node);near.delete(node);tracked.delete(node)}
    }
    request();
  };
  const clear=()=>{
    for(const [node,state] of tracked){
      if(node.isConnected)node.style.translate=state.original;
      state.last=null;
    }
  };
  const bridge=()=>{
    const hero=document.querySelector('.hero');
    const panel=document.querySelector('.hotels-panel');
    const badge=hero?.querySelector('.headline-highlight');
    if(!hero||!panel||!badge)return;
    let queued=false;
    const update=()=>{
      queued=false;
      if(reduce.matches){
        root.classList.remove('quest-stage-bridge');
        panel.style.removeProperty('--quest-stage-side');
        panel.style.removeProperty('--quest-stage-top');
        panel.style.removeProperty('--quest-stage-content');
        hero.style.removeProperty('--quest-bridge-lift');
        return;
      }
      const r=panel.getBoundingClientRect();
      const h=hero.getBoundingClientRect();
      const header=document.querySelector('.header');
      const nav=header?.getBoundingClientRect().height||80;
      const start=innerHeight+Math.min(r.height*.24,160);
      const end=nav+Math.min(innerHeight*.15,125);
      const progress=smooth((start-r.top)/(start-end));
      const side=Math.max(0,(r.width-badge.getBoundingClientRect().width)/2);
      const top=Math.max(0,(r.height-badge.getBoundingClientRect().height)/2);
      root.classList.add('quest-stage-bridge');
      panel.style.setProperty('--quest-stage-side',(side*(1-progress)).toFixed(1)+'px');
      panel.style.setProperty('--quest-stage-top',(top*(1-progress)).toFixed(1)+'px');
      panel.style.setProperty('--quest-stage-content',String(smooth((progress-.55)/.4)));
      const leave=smooth((innerHeight*.55-h.bottom)/(innerHeight*.4));
      hero.style.setProperty('--quest-bridge-lift',(-12*leave*(mobile.matches?.5:1)).toFixed(1)+'px');
    };
    const request=()=>{if(!queued){queued=true;requestAnimationFrame(update)}};
    addEventListener('scroll',request,{passive:true});
    addEventListener('resize',request,{passive:true});
    addEventListener('pageshow',request);
    reduce.addEventListener?.('change',request);
    document.fonts?.ready.then(request).catch(()=>{});
    request();
  };
  const init=()=>{
    scan();
    const dynamic=document.querySelector('#app');
    if(dynamic)new MutationObserver(scan).observe(dynamic,{childList:true,subtree:true});
    addEventListener('scroll',request,{passive:true});
    addEventListener('resize',request,{passive:true});
    addEventListener('pageshow',request);
    mobile.addEventListener?.('change',request);
    reduce.addEventListener?.('change',()=>{if(reduce.matches)clear();else request()});
    bridge();
    request();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
