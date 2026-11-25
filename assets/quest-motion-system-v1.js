(() => {
  const html=document.documentElement;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:700px)');
  const activeAnimations=new Set();
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const wait=(ms,fn)=>setTimeout(fn,ms);
  const play=(element,options={})=>{
    if(!element || reduce.matches || !element.getClientRects().length || typeof element.animate!=='function') return;
    const style=getComputedStyle(element);
    const memberStyle=!element.closest('.hero');
    const base=style.transform==='none'?'':style.transform;
    const dx=(options.x||0)*(mobile.matches?.5:1);
    const dy=(options.y||0)*(mobile.matches?.55:1);
    const parsedOpacity=parseFloat(style.opacity);
    const opacity=Number.isFinite(parsedOpacity)?parsedOpacity:1;
    const from='translate3d('+dx+'px,'+dy+'px,0) '+base;
    const settle='translate3d('+(-dx*.075)+'px,'+(-dy*.075)+'px,0) '+base;
    const to=base||'none';
    try{
      const animation=element.animate([
        {transform:from,opacity:Math.max(.55,opacity*(options.opacity??.76)),offset:0},
        {transform:settle,opacity:opacity,offset:.84},
        {transform:to,opacity:opacity,offset:1}
      ],{
        duration:memberStyle?Math.max(750,Math.min(900,(options.duration||650)+150)):(options.duration||650),
        delay:options.delay||0,
        easing:memberStyle?'cubic-bezier(.22,1,.36,1)':'cubic-bezier(.2,.82,.2,1)',
        fill:'backwards'
      });
      activeAnimations.add(animation);
      animation.finished.catch(()=>{}).finally(()=>activeAnimations.delete(animation));
    }catch(_){}
  };
  const playShift=(element,options={})=>{
    if(!element || reduce.matches || !element.getClientRects().length || typeof element.animate!=='function')return;
    const style=getComputedStyle(element);
    const memberStyle=!element.closest('.hero');
    const pieces=(style.translate==='none'?'0px 0px':style.translate).split(' ');
    const x=pieces[0]||'0px',y=pieces[1]||'0px';
    const shifted=(value,delta)=>delta>=0?'calc('+value+' + '+delta+'px)':'calc('+value+' - '+Math.abs(delta)+'px)';
    const dx=(options.x||0)*(mobile.matches?.5:1);
    const dy=(options.y||0)*(mobile.matches?.55:1);
    const parsedOpacity=parseFloat(style.opacity);
    const opacity=Number.isFinite(parsedOpacity)?parsedOpacity:1;
    try{
      const animation=element.animate([
        {translate:shifted(x,dx)+' '+shifted(y,dy),opacity:Math.max(.55,opacity*(options.opacity??.76)),offset:0},
        {translate:shifted(x,-dx*.075)+' '+shifted(y,-dy*.075),opacity:opacity,offset:.84},
        {translate:x+' '+y,opacity:opacity,offset:1}
      ],{duration:memberStyle?Math.max(750,Math.min(900,(options.duration||650)+150)):(options.duration||650),delay:options.delay||0,easing:memberStyle?'cubic-bezier(.22,1,.36,1)':'cubic-bezier(.2,.82,.2,1)',fill:'backwards'});
      activeAnimations.add(animation);
      animation.finished.catch(()=>{}).finally(()=>activeAnimations.delete(animation));
    }catch(_){}
  };
  const onceNear=(element,callback,margin='0px 0px 8% 0px')=>{
    if(!element)return;
    if(!('IntersectionObserver' in window)){callback();return}
    const observer=new IntersectionObserver(entries=>{
      if(!entries[0].isIntersecting)return;
      observer.disconnect();
      callback();
    },{rootMargin:margin,threshold:.04});
    observer.observe(element);
  };
  const hero=()=>{
    const section=document.querySelector('.hero');
    if(!section)return;
    const launched=new Set();
    const trigger=(name,fn)=>{
      if(launched.has(name))return;
      launched.add(name);
      fn();
    };
    const patterns=()=>trigger('patterns',()=>{
      playShift(section.querySelector('.hero-pattern-accent--left'),{y:16,opacity:.65,duration:680});
      playShift(section.querySelector('.hero-pattern-accent--right'),{y:19,opacity:.65,duration:720,delay:90});
    });
    const headline=()=>trigger('headline',()=>{
      play(section.querySelector('.headline-first'),{y:17,opacity:.58,duration:580});
      play(section.querySelector('.headline-highlight'),{y:22,opacity:.7,duration:730,delay:95});
      play(section.querySelector('.headline-stage h1 strong'),{y:16,opacity:.65,duration:690,delay:230});
      play(section.querySelector('.headline-underline'),{y:8,opacity:.65,duration:470,delay:360});
      section.querySelectorAll('.headline-rays').forEach((ray,index)=>play(ray,{y:7,opacity:.5,duration:410,delay:500+index*50}));
    });
    const booking=()=>trigger('booking',()=>play(section.querySelector('.booking'),{y:20,opacity:.82,duration:590,delay:70}));
    const synchronize=()=>{
      if(html.classList.contains('quest-show-corners'))patterns();
      if(html.classList.contains('quest-show-headline'))headline();
      if(html.classList.contains('quest-show-booking'))booking();
      if(!html.classList.contains('quest-splash-pending')){
        patterns();wait(90,headline);wait(530,booking);
        observer.disconnect();
      }
    };
    const observer=new MutationObserver(synchronize);
    observer.observe(html,{attributes:true,attributeFilter:['class']});
    synchronize();
    wait(6500,()=>{patterns();headline();booking();observer.disconnect()});
  };
  const hotels=()=>{
    const section=document.querySelector('.hotels');
    onceNear(section,()=>{
      play(section.querySelector('.hotels-title-tab'),{x:-20,y:8,opacity:.7,duration:660});
      section.querySelectorAll('.destination-row').forEach((row,index)=>play(row,{x:-13,y:3,opacity:.7,duration:480,delay:100+index*75}));
      play(section.querySelector('.hotel-cards'),{y:23,opacity:.76,duration:730,delay:170});
      play(section.querySelector('.hotel-location'),{x:13,y:6,opacity:.65,duration:500,delay:280});
      play(section.querySelector('.hotel-details h3'),{x:13,y:7,opacity:.65,duration:580,delay:350});
      play(section.querySelector('.hotel-description'),{y:9,opacity:.7,duration:520,delay:420});
      play(section.querySelector('.hotel-explore'),{y:8,opacity:.75,duration:430,delay:490});
    });
  };
  const offers=()=>{
    const section=document.querySelector('.offers');
    onceNear(section,()=>{
      play(section.querySelector('.offers-intro h2'),{x:-24,y:5,opacity:.65,duration:720});
      play(section.querySelector('.offers-intro p'),{y:12,opacity:.7,duration:560,delay:130});
      play(section.querySelector('.offers-all'),{y:8,opacity:.75,duration:450,delay:240});
    });
    const list=section?.querySelector('.offers-list');
    if(!list)return;
    const seen=new WeakSet();
    const observeTicket=element=>{
      if(seen.has(element))return;
      seen.add(element);
      onceNear(element,()=>{
        const index=[...element.parentElement.children].indexOf(element);
        play(element,{x:mobile.matches?0:28,y:mobile.matches?14:5,opacity:.72,duration:610,delay:Math.min(index,4)*95});
      },'0px 0px 7% 0px');
    };
    const scan=()=>list.querySelectorAll('.offer-ticket').forEach(observeTicket);
    scan();
    new MutationObserver(scan).observe(list,{childList:true});
  };
  const news=()=>{
    const section=document.querySelector('.news-stage');
    onceNear(section,()=>{
      const path=section.querySelector('.news-stage-underline path');
      if(!path || reduce.matches || typeof path.animate!=='function')return;
      try{
        const length=path.getTotalLength();
        const animation=path.animate([
          {strokeDasharray:length,strokeDashoffset:length},
          {strokeDasharray:length,strokeDashoffset:0}
        ],{duration:680,delay:260,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
        activeAnimations.add(animation);
        animation.finished.catch(()=>{}).finally(()=>activeAnimations.delete(animation));
      }catch(_){}
    });
  };
  const reels=()=>{
    const section=document.querySelector('.reels-section');
    onceNear(section,()=>{
      play(section.querySelector('.reels-phone-heading'),{y:18,opacity:.65,duration:650});
      playShift(section.querySelector('.reels-pattern-block--left'),{x:-34,opacity:.65,duration:710,delay:30});
      playShift(section.querySelector('.reels-pattern-block--right'),{x:34,opacity:.65,duration:730,delay:110});
      play(section.querySelector('.reels-phone'),{y:24,opacity:.8,duration:740,delay:160});
      ['inner-left','inner-right','outer-left','outer-right'].forEach((name,index)=>{
        play(section.querySelector('.reels-phone-slot--'+name),{x:index%2?22:-22,y:9,opacity:.68,duration:590,delay:260+index*80});
      });
      play(document.querySelector('.reels-phone-mode + .social-ribbon'),{y:4,opacity:.82,duration:450,delay:620});
    });
  };
  const footer=()=>{
    const foot=document.querySelector('footer.footer');
    if(!foot)return;
    [
      ['.qf-cta-content',0],
      ['.qf-logo-social',0],
      ['.qf-main-grid nav',75],
      ['.qf-awards',150],
      ['.qf-bottom',0]
    ].forEach(([selector,delay])=>{
      const element=foot.querySelector(selector);
      onceNear(element,()=>play(element,{y:16,opacity:.72,duration:570,delay}));
    });
  };
  const parallax=()=>{
    const targets=[
      [document.querySelector('.hero'),[...document.querySelectorAll('.hero-pattern-accent img')],24],
      [document.querySelector('.offers'),[...document.querySelectorAll('.offers-news-pattern')],17],
      [document.querySelector('.news-stage'),[...document.querySelectorAll('.news-stage-pattern')],15]
    ];
    let queued=false;
    const update=()=>{
      queued=false;
      if(reduce.matches)return;
      const height=innerHeight;
      targets.forEach(([section,elements,strength],group)=>{
        if(!section || !elements.length)return;
        const rect=section.getBoundingClientRect();
        if(rect.bottom<0 || rect.top>height)return;
        const progress=clamp((height-rect.top)/(height+rect.height),0,1);
        const shift=(progress-.5)*strength*(mobile.matches?.42:1);
        elements.forEach((element,index)=>{
          element.style.setProperty('--quest-parallax-y',shift.toFixed(1)+'px');
          if(group===0){
            const exit=clamp(-rect.top/rect.height,0,1)*(mobile.matches?4:10);
            element.style.setProperty('--quest-parallax-x',((index?1:-1)*exit).toFixed(1)+'px');
          }
        });

      });
    };
    const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(update)}};
    addEventListener('scroll',schedule,{passive:true});
    addEventListener('resize',schedule,{passive:true});
    schedule();
  };
  const pauseOffscreen=()=>{
    if(!('IntersectionObserver' in window))return;
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>entry.target.classList.toggle('quest-motion-offscreen',!entry.isIntersecting));
    },{threshold:0});
    ['.hero','.hotels','.offers','.news-stage','.reels-section','.membership-redesign','.social-ribbon','.qf-brands-viewport'].forEach(selector=>{
      const element=document.querySelector(selector);
      if(element)observer.observe(element);
    });
  };
  const init=()=>{
    hero();hotels();offers();news();reels();footer();parallax();pauseOffscreen();
    reduce.addEventListener?.('change',()=>{
      if(reduce.matches){
        activeAnimations.forEach(animation=>animation.cancel());
        document.querySelectorAll('[style*="--quest-parallax"]').forEach(element=>{
          element.style.removeProperty('--quest-parallax-x');
          element.style.removeProperty('--quest-parallax-y');
        });
      }
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
