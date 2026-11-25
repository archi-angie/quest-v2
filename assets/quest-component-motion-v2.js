(() => {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:700px)');
  const root=document.documentElement;
  const seen=new WeakSet();
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
  const animate=(element,index=0,axis='y')=>{
    if(!element || reduce.matches || typeof element.animate!=='function')return;
    const distance=(mobile.matches?8:16);
    const dx=axis==='x'?(index%2?distance:-distance):0;
    const dy=axis==='y'?distance:4;
    const animation=element.animate([
      {translate:dx+'px '+dy+'px',opacity:.62,offset:0},
      {translate:(-dx*.07)+'px '+(-dy*.07)+'px',opacity:1,offset:.82},
      {translate:'0px 0px',opacity:1,offset:1}
    ],{duration:mobile.matches?480:650,delay:Math.min(index%5,4)*(mobile.matches?45:75),easing:'cubic-bezier(.2,.8,.23,1)',fill:'backwards'});
    animation.finished.catch(()=>{});
  };
  const watch=(node,index,axis)=>{
    if(!node || seen.has(node))return;
    seen.add(node);
    if(!('IntersectionObserver' in window)){animate(node,index,axis);return}
    const observer=new IntersectionObserver(entries=>{
      if(!entries[0].isIntersecting)return;
      observer.disconnect();
      animate(node,index,axis);
    },{threshold:.08,rootMargin:'0px 0px 5% 0px'});
    observer.observe(node);
  };
  const targets=[
    ['.hero',['.booking label','.booking-submit','.booking-message'],0],
    ['.hotels',['.destination-column h3','.destination-row','.hotel-cards','.carousel-controls','.hotel-location','.hotel-details h3','.hotel-description','.hotel-explore'],1],
    ['.offers',['.offer-thumbnail-wrap','.offer-count','.offer-title','.offer-ticket-copy p','.offer-learn'],2],
    ['.news-stage',['.news-stage-oval','.news-stage-heading','.news-stage-preview','.news-stage-featured-image','.news-stage-badge','.news-stage-date-sticker','.news-stage-featured h3','.news-stage-featured p','.news-stage-action','.news-stage-control'],3],
    ['.reels-section',['.reels-phone-slot','.reels-phone-controls','.reels-phone-dots button'],4],
    ['.membership-redesign',['.membership-headline-left','.membership-headline-right','.membership-banner','.membership-big','.membership-platform','.membership-stores a'],5],
    ['.footer',['.qf-cta','.qf-logo-social','.qf-main-grid a','.qf-awards>*','.qf-bottom a','.qf-brands-viewport'],6]
  ];
  const scan=()=>{
    targets.forEach(([sectionSelector,selectors,group])=>{
      const section=document.querySelector(sectionSelector);
      if(!section)return;
      selectors.forEach((selector,n)=>{
        section.querySelectorAll(selector).forEach((node,i)=>{
          if(node.closest('.offer-ticket') && selector!=='.offer-thumbnail-wrap') watch(node,n+i,'y');
          else watch(node,n+i,group===3&&n===2?'x':'y');
        });
      });
    });
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
    bridge();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
