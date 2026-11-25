(() => {
  const root = document.documentElement;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 700px)');
  const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b, v));
  const ease = (a, b, x) => { const t=clamp((x-a)/(b-a)); return t*t*(3-2*t); };
  const mix = (a,b,t) => a+(b-a)*t;
  const px = v => v.toFixed(2)+'px';
  const init = () => {
    const hero=document.querySelector('.hero');
    const hotels=document.querySelector('.hotels');
    const highlight=hero?.querySelector('.headline-highlight');
    const panel=hotels?.querySelector('.hotels-panel');
    const booking=hero?.querySelector('.booking-shell');
    if(!hero || !hotels || !highlight || !panel || !booking || !('requestAnimationFrame' in window)) return;

    const track=document.createElement('div');
    track.className='quest-morph-track';
    hero.parentNode.insertBefore(track,hero);
    track.appendChild(hero);
    const shape=document.createElement('div');
    shape.className='quest-morph-shape';
    shape.setAttribute('aria-hidden','true');
    hero.insertBefore(shape,hero.querySelector('.hero-inner'));
    root.classList.add('quest-morph-enabled');

    let metrics=null, frame=0, lastRunning=false, suspended=false;
    const restore=()=>{
      root.classList.remove('quest-morph-running');
      hero.style.removeProperty('--quest-hero-copy');
      hero.style.removeProperty('--quest-booking-copy');
      hero.style.removeProperty('--quest-morph-bg-y');
      hotels.style.removeProperty('--quest-hotels-reveal');
      hotels.style.removeProperty('--quest-hotels-offset');
      shape.style.visibility='hidden';
      hero.classList.remove('quest-morph-hero-hidden');
      lastRunning=false;
    };
    const measure=()=>{
      if(media.matches){restore();track.style.removeProperty('--quest-pin-height');track.style.removeProperty('--quest-hero-height');metrics=null;return}
      const isMobile=mobile.matches;
      const heroHeight=hero.offsetHeight;
      const distance=isMobile?0:Math.round(clamp(innerHeight*1.16,620,1400));
      track.style.setProperty('--quest-hero-height',px(heroHeight));
      track.style.setProperty('--quest-pin-height',px(heroHeight+distance));
      if(isMobile){restore();metrics=null;return}
      const start=track.getBoundingClientRect().top+scrollY;
      const end=start+distance;
      const hr=hero.getBoundingClientRect(), sr=highlight.getBoundingClientRect(), pr=panel.getBoundingClientRect();
      const w=highlight.offsetWidth,h=highlight.offsetHeight;
      const sx=(sr.left+sr.right)/2-hr.left-w/2;
      const sy=(sr.top+sr.bottom)/2-hr.top-h/2;
      const target={x:pr.left,y:pr.top+scrollY-end,w:panel.offsetWidth,h:panel.offsetHeight};
      const style=getComputedStyle(highlight);
      const matrix=new DOMMatrixReadOnly(style.transform==='none'?undefined:style.transform);
      const angle=Math.atan2(matrix.b,matrix.a)*180/Math.PI;
      const startRadius=parseFloat(style.borderTopLeftRadius)||15;
      const endRadius=parseFloat(getComputedStyle(panel).borderTopLeftRadius)||40;
      metrics={start,end,distance,from:{x:sx,y:sy,w,h,angle,radius:startRadius},to:{...target,angle:0,radius:endRadius}};
      request();
    };
    const render=()=>{
      frame=0;
      if(!metrics || media.matches || mobile.matches || root.classList.contains('quest-splash-pending')){restore();return}
      const p=clamp((scrollY-metrics.start)/metrics.distance);
      const focus=booking.contains(document.activeElement) || !!document.querySelector('.qb-enhanced[aria-expanded="true"], .qb-bottomsheet.is-open, .qb-bottomsheet[open]');
      const running=p>.001 && p<.995;
      if(!running){restore();return}
      root.classList.add('quest-morph-running');
      lastRunning=true;
      const t=ease(.18,.79,p), reveal=ease(.65,.94,p);
      const a=metrics.from,b=metrics.to;
      shape.style.visibility='visible';
      shape.style.left=px(mix(a.x,b.x,t));
      shape.style.top=px(mix(a.y,b.y,t));
      shape.style.width=px(mix(a.w,b.w,t));
      shape.style.height=px(mix(a.h,b.h,t));
      shape.style.borderRadius=px(mix(a.radius,b.radius,t));
      shape.style.boxShadow=px(mix(7,12,t))+' '+px(mix(7,12,t))+' 0 #3d0c50';
      shape.style.transform='rotate('+mix(a.angle,0,t).toFixed(3)+'deg)';
      shape.style.setProperty('--quest-stage-pattern',String(t*.035));
      hero.style.setProperty('--quest-hero-copy',String(1-ease(.04,.3,p)));
      hero.style.setProperty('--quest-booking-copy',String(focus?1:1-ease(.14,.48,p)));
      hero.style.setProperty('--quest-morph-bg-y',px(p*22));
      hotels.style.setProperty('--quest-hotels-reveal',String(reveal));
      hotels.style.setProperty('--quest-hotels-offset',px((1-reveal)*17));
      hero.classList.toggle('quest-morph-hero-hidden',p>.52&&!focus);
    };
    const request=()=>{if(!frame)frame=requestAnimationFrame(render)};
    const onResize=()=>{cancelAnimationFrame(frame);frame=0;measure()};
    addEventListener('scroll',request,{passive:true});
    addEventListener('resize',onResize,{passive:true});
    addEventListener('orientationchange',onResize,{passive:true});
    addEventListener('pageshow',onResize);
    media.addEventListener?.('change',onResize);
    mobile.addEventListener?.('change',onResize);
    booking.addEventListener('focusin',request);
    booking.addEventListener('focusout',()=>setTimeout(request,0));
    const resizeObserver='ResizeObserver' in window?new ResizeObserver(()=>{if(!frame)requestAnimationFrame(measure)}):null;
    resizeObserver?.observe(hero);
    resizeObserver?.observe(panel);
    document.fonts?.ready.then(onResize).catch(()=>{});
    hero.querySelectorAll('img').forEach(img=>{if(!img.complete)img.addEventListener('load',onResize,{once:true})});
    measure();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
