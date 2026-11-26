(() => {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:700px)');
  const defs=[
    ['.hero','rise'],
    ['.hotels','flip'],
    ['.offers','skew'],
    ['.news-stage','wave'],
    ['.reels-section','pop'],
    ['.membership-redesign','rise'],
    ['footer.footer','blur']
  ];
  const seen=new WeakSet(), active=new Set(), timers=new Map(), running=new Map();
  const sections=[];
  const ease={rise:'cubic-bezier(.22,1,.36,1)',flip:'cubic-bezier(.2,.82,.2,1)',skew:'cubic-bezier(.22,1,.36,1)',pop:'cubic-bezier(.18,1.3,.32,1)',wave:'cubic-bezier(.2,.82,.2,1)',blur:'cubic-bezier(.22,1,.36,1)'};
  const animate=(el,frames,options)=>{
    try { const a=el.animate(frames,options);a.finished.catch(()=>{});return a } catch(_) {return null}
  };
  const split=el=>{
    if(el.children.length||el.textContent.trim().length>28||el.textContent.trim().length<3)return null;
    const value=el.textContent;
    if(!value.trim())return null;
    el.setAttribute('aria-label',value.trim());
    el.textContent='';
    const chars=[];
    value.split(/(\s+)/).forEach(token=>{
      if(/^\s+$/.test(token)){el.append(document.createTextNode(token));return}
      const word=document.createElement('span');
      word.className='quest-text-word';
      word.setAttribute('aria-hidden','true');
      for(const letter of Array.from(token)){
        const char=document.createElement('span');
        char.className='quest-text-char';
        char.textContent=letter;
        word.append(char);chars.push(char);
      }
      el.append(word);
    });
    return chars;
  };
  const charFrames=effect=>{
    const shift=mobile.matches?10:17;
    if(effect==='flip')return [{opacity:.25,transform:'perspective(400px) rotateX(-58deg) translateY('+shift+'px)'},{opacity:1,transform:'none'}];
    if(effect==='skew')return [{opacity:.3,transform:'translateY('+shift+'px) skewY(9deg)'},{opacity:1,transform:'none'}];
    if(effect==='pop')return [{opacity:.25,transform:'translateY('+shift+'px) scale(.65)',offset:0},{opacity:1,transform:'translateY(-2px) scale(1.07)',offset:.78},{opacity:1,transform:'none',offset:1}];
    if(effect==='wave')return [{opacity:.35,transform:'translateY('+shift+'px)'},{opacity:1,transform:'translateY(-3px)',offset:.72},{opacity:1,transform:'none'}];
    if(effect==='blur')return [{opacity:.25,filter:'blur(5px)',transform:'translateY(8px)'},{opacity:1,filter:'blur(0)',transform:'none'}];
    return [{opacity:.35,transform:'translateY('+shift+'px)'},{opacity:1,transform:'none'}];
  };
  const addInteraction=(el,chars)=>{
    if(el.dataset.questTextInteractive)return;
    el.dataset.questTextInteractive='true';
    let frame=0;
    el.addEventListener('pointermove',event=>{
      if(reduce.matches||event.pointerType==='touch'||!active.has(el.closest('.section,footer')))return;
      if(frame)cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        chars.forEach(char=>{
          const box=char.getBoundingClientRect();
          const distance=Math.abs(event.clientX-(box.left+box.width/2));
          const lift=Math.max(0,1-distance/76)*(mobile.matches?3:6);
          char.style.translate='0 '+(-lift).toFixed(1)+'px';
        });
      });
    },{passive:true});
    el.addEventListener('pointerleave',()=>{
      if(frame)cancelAnimationFrame(frame);
      chars.forEach(char=>char.style.translate='');
    });
  };
  const loop=(section,headings)=>{
    if(timers.has(section))clearTimeout(timers.get(section));
    if(!active.has(section)||reduce.matches||document.hidden)return;
    timers.set(section,setTimeout(()=>{
      if(!active.has(section)||reduce.matches||document.hidden)return;
      headings.forEach(({chars})=>{
        chars.forEach((char,index)=>animate(char,[
          {opacity:1,transform:'translateY(0)',offset:0},
          {opacity:.55,transform:'translateY(-6px)',offset:.45},
          {opacity:1,transform:'translateY(0)',offset:1}
        ],{duration:470,delay:index*50,easing:'cubic-bezier(.22,1,.36,1)'}));
      });
      loop(section,headings);
    },7500));
  };
  const reveal=(section,effect)=>{
    if(reduce.matches)return;
    const headings=[];
    const titleCandidates=section.querySelectorAll('h1,h2,h3,h4,.headline-first,.headline-highlight>span,.headline-stage h1 strong,#offers-title>span,#offers-title>strong,.membership-banner-text,.membership-big');
    titleCandidates.forEach(el=>{
      if(el.closest('.sr-only,[aria-hidden="true"],.social-ribbon,.reels-track,.news-stage-underline')||!el.getClientRects().length||seen.has(el))return;
      seen.add(el);
      const chars=split(el);
      if(!chars){animate(el,[{opacity:.55,filter:'blur(3px)'},{opacity:1,filter:'blur(0)'}],{duration:650,easing:ease[effect]});return}
      headings.push({el,chars});
      addInteraction(el,chars);
      chars.forEach((char,index)=>animate(char,charFrames(effect),{
        duration:effect==='pop'?650:590,
        delay:Math.min(index*50,1100),
        easing:ease[effect],
        fill:'backwards'
      }));
    });
    const copy=section.querySelectorAll('p,li,small,label,button,a');
    let index=0;
    copy.forEach(el=>{
      if(seen.has(el)||!el.getClientRects().length||el.closest('.sr-only,[aria-hidden="true"],.social-ribbon,.reels-track,.hero-gallery,.booking-panel,.qb-panel,.mobile-menu')||el.closest('h1,h2,h3'))return;
      if(el.children.length&&el.querySelector('p,li,small,label,button,a'))return;
      seen.add(el);
      const offset=mobile.matches?6:10;
      animate(el,[{opacity:.68,translate:'0 '+offset+'px',filter:'blur(2px)'},{opacity:1,translate:'0 0',filter:'blur(0)'}],{
        duration:510,delay:Math.min(index++*45,540),easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'
      });
    });
    if(headings.length){running.set(section,headings);loop(section,headings)}
  };
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const section=entry.target;
      if(entry.isIntersecting){
        active.add(section);
        if(section.matches('.hero')&&document.documentElement.classList.contains('quest-splash-pending'))return;
        reveal(section,section.dataset.questTextEffect);
        if(running.has(section))loop(section,running.get(section));
      }else{
        active.delete(section);
        clearTimeout(timers.get(section));timers.delete(section);
      }
    });
  },{rootMargin:'0px 0px -7% 0px',threshold:.02}):null;
  const init=()=>{
    defs.forEach(([selector,effect])=>{
      const section=document.querySelector(selector);
      if(!section)return;
      section.dataset.questTextEffect=effect;
      sections.push(section);
      if(observer)observer.observe(section);else{active.add(section);reveal(section,effect)}
    });
    const hero=document.querySelector('.hero');
    if(hero&&document.documentElement.classList.contains('quest-splash-pending')){
      const splash=new MutationObserver(()=>{
        if(!document.documentElement.classList.contains('quest-splash-pending')){
          if(active.has(hero))reveal(hero,'rise');
          splash.disconnect();
        }
      });
      splash.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    }
    document.addEventListener('visibilitychange',()=>sections.forEach(section=>{
      if(document.hidden){clearTimeout(timers.get(section));timers.delete(section)}
      else if(active.has(section)&&running.has(section))loop(section,running.get(section));
    }));
    reduce.addEventListener?.('change',()=>sections.forEach(section=>{
      clearTimeout(timers.get(section));timers.delete(section);
      if(!reduce.matches&&active.has(section)&&running.has(section))loop(section,running.get(section));
    }));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();