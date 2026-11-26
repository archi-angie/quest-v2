(() => {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:700px)');
  const specs=[
    ['.hero-pattern-accent img','.hero'],
    ['.hotels-corner img','.hotels'],
    ['.offers-corner-arc','.offers'],
    ['.news-stage-pattern','.news-stage'],
    ['.reels-pattern-block','.reels-section'],
    ['.qf-pattern','footer.footer'],
    ['.footer-pattern','footer.footer']
  ];
  const items=new Map();
  const active=new Set();
  const animations=new Map();
  const popped=new WeakSet();
  const sections=new Set();
  const sectionObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const section=entry.target;
      if(entry.isIntersecting){
        active.add(section);
        if(section.matches('.hero')&&document.documentElement.classList.contains('quest-splash-pending'))return;
        [...(items.get(section)||[])].forEach((element,index)=>pop(element,index));
      }else{
        active.delete(section);
        (items.get(section)||[]).forEach(stop);
      }
    });
  },{rootMargin:'0px 0px 15% 0px',threshold:.01}):null;
  const direction=element=>{
    const host=element.closest('[class*="left"],[class*="right"]')||element;
    const name=String(host.className?.baseVal||host.className||'');
    const side=/left/.test(name)?-1:/right/.test(name)?1:element.getBoundingClientRect().left+element.getBoundingClientRect().width/2<innerWidth/2?-1:1;
    const corner=/corner|arc/.test(name);
    const section=element.closest('.section,footer');
    const box=host.getBoundingClientRect();
    const boundary=section?.getBoundingClientRect();
    const vertical=boundary&&box.top+box.height/2>boundary.top+boundary.height/2?1:-1;
    return {side,corner,vertical};
  };
  const stop=element=>{
    const record=animations.get(element);
    if(record){record.pop?.cancel();record.idle?.cancel();element.style.willChange=record.willChange;animations.delete(element)}
    popped.delete(element);
  };
  const idle=(element,record,index)=>{
    if(reduce.matches||!active.has(record.section)||document.hidden)return;
    const sign=record.side;
    const base=record.base;
    try{
      record.idle=element.animate([
        {transform:base||'none',offset:0},
        {transform:'translate3d(0,-4px,0) rotate('+(sign*1.2)+'deg) '+base,offset:.45},
        {transform:'translate3d(0,2px,0) rotate('+(-sign*.7)+'deg) '+base,offset:.8},
        {transform:base||'none',offset:1}
      ],{duration:4800+(index%3)*450,delay:sign>0?-800:0,iterations:Infinity,easing:'ease-in-out'});
    }catch(_){}
  };
  const pop=(element,index)=>{
    if(reduce.matches||popped.has(element)||!element.isConnected||!element.getClientRects().length)return;
    const section=[...items.keys()].find(s=>items.get(s)?.includes(element));
    if(!section||!active.has(section))return;
    const style=getComputedStyle(element);
    const base=style.transform==='none'?'':style.transform;
    const {side,corner,vertical}=direction(element);
    const dx=side*(mobile.matches?32:68);
    const dy=corner?vertical*(mobile.matches?15:27):(mobile.matches?10:20);
    const record={section,side,base,willChange:element.style.willChange,pop:null,idle:null};
    animations.set(element,record);
    popped.add(element);
    element.style.pointerEvents='none';
    element.style.willChange='transform';
    try{
      record.pop=element.animate([
        {transform:'translate3d('+dx+'px,'+dy+'px,0) rotate('+(side*11)+'deg) scale(.64) '+base,offset:0},
        {transform:'translate3d('+(-dx*.14)+'px,'+(-dy*.16)+'px,0) rotate('+(-side*2.4)+'deg) scale(1.13) '+base,offset:.68},
        {transform:'translate3d('+(dx*.025)+'px,'+(dy*.025)+'px,0) rotate('+(side*.5)+'deg) scale(.985) '+base,offset:.88},
        {transform:base||'none',offset:1}
      ],{duration:960,delay:Math.min(index,3)*95,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'});
      record.pop.finished.then(()=>{record.pop=null;if(animations.get(element)===record)idle(element,record,index)}).catch(()=>{});
    }catch(_){element.style.willChange=record.willChange;animations.delete(element)}
  };
  const scan=()=>{
    specs.forEach(([selector,sectionSelector])=>{
      document.querySelectorAll(selector).forEach(element=>{
        const section=element.closest(sectionSelector);
        if(!section)return;
        if(!items.has(section))items.set(section,[]);
        const group=items.get(section);
        if(group.includes(element))return;
        group.push(element);
        if(!sections.has(section)){sections.add(section);sectionObserver?.observe(section)}
        if(!sectionObserver){active.add(section);pop(element,group.length-1)}
        else if(active.has(section)&&!(section.matches('.hero')&&document.documentElement.classList.contains('quest-splash-pending')))pop(element,group.length-1);
      });
    });
  };
  const init=()=>{
    scan();
    const app=document.getElementById('app')||document.body;
    const mutations=new MutationObserver(scan);
    mutations.observe(app,{childList:true,subtree:true});
    const splashObserver=new MutationObserver(()=>{
      if(!document.documentElement.classList.contains('quest-splash-pending')){
        const hero=document.querySelector('.hero');
        if(hero&&active.has(hero))(items.get(hero)||[]).forEach((element,index)=>pop(element,index));
        splashObserver.disconnect();
      }
    });
    if(document.documentElement.classList.contains('quest-splash-pending'))splashObserver.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    addEventListener('resize',()=>{scan();active.forEach(section=>(items.get(section)||[]).forEach((element,index)=>pop(element,index)))},{passive:true});
    document.addEventListener('visibilitychange',()=>animations.forEach(record=>{
      if(record.idle){if(document.hidden)record.idle.pause();else if(active.has(record.section)&&!reduce.matches)record.idle.play()}
      if(record.pop){if(document.hidden)record.pop.pause();else if(!reduce.matches)record.pop.play()}
    }));
    reduce.addEventListener?.('change',()=>{if(reduce.matches)items.forEach(group=>group.forEach(stop));else active.forEach(section=>(items.get(section)||[]).forEach((element,index)=>pop(element,index)))});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();