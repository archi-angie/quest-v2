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
    const entry=Math.min(height*.48,mobile.matches?235:420);
    const leave=Math.min(height*.35,mobile.matches?175:275);
    for(const node of near){
      if(!node.isConnected){near.delete(node);tracked.delete(node);continue}
      const state=tracked.get(node);
      if(!state)continue;
      const rect=node.getBoundingClientRect();
      let ancestorShift=0;
      for(let parent=node.parentElement;parent;parent=parent.parentElement){
        ancestorShift+=tracked.get(parent)?.last||0;
      }
      const top=rect.top-(state.last||0)-ancestorShift;
      const bottom=rect.bottom-(state.last||0)-ancestorShift;
      const stagger=state.order*(mobile.matches?12:30);
      const inProgress=state.section==='.hero'?1:clamp((height-top-stagger)/entry);
      const outProgress=clamp((bottom-nav+stagger)/leave);
      const distance=(mobile.matches?34:64)*state.factor;
      const shift=(1-smooth(inProgress))*distance-(1-smooth(outProgress))*distance*.76;
      const visual=/gallery|card|thumbnail|image|reels-phone|membership-visual|oval|ticket/.test(node.className||'');
      const minimum=visual?.34:.56;
      const visibility=Math.min(smooth(inProgress),smooth(outProgress));
      const opacity=minimum+(1-minimum)*visibility;
      if(Math.abs((state.last??100)-shift)>.16){
        node.style.translate='0px '+shift.toFixed(2)+'px';
        state.last=shift;
      }
      const preservesOwnOpacity=state.section==='.news-stage'||node.matches('.hotel-details,.reels-pattern-block');
      if(!preservesOwnOpacity && Math.abs((state.lastOpacity??-1)-opacity)>.006){
        node.style.opacity=opacity.toFixed(3);
        state.lastOpacity=opacity;
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
      let order=0;
      for(const [selector,factor] of items){
        for(const node of section.querySelectorAll(selector)){
          if(tracked.has(node))continue;
          node.classList.add('quest-scroll-piece');
          tracked.set(node,{factor,section:sectionSelector,order:Math.min(order++,4),original:node.style.translate,originalOpacity:node.style.opacity,last:null,lastOpacity:null});
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
      if(node.isConnected){node.style.translate=state.original;node.style.opacity=state.originalOpacity}
      state.last=null;
      state.lastOpacity=null;
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
