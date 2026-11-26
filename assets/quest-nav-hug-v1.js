(() => {
  const desktop=matchMedia('(min-width:701px)');
  let header, frame=0;
  const measure=()=>{
    frame=0;
    if(!header?.isConnected)return;
    if(!desktop.matches){
      header.style.removeProperty('--quest-nav-hug-width');
      header.style.removeProperty('--quest-nav-left');
      return;
    }
    const children=[header.querySelector('.brand'),header.querySelector('.desktop-nav'),header.querySelector('.nav-book')].filter(el=>el&&getComputedStyle(el).display!=='none');
    if(children.length!==3)return;
    const style=getComputedStyle(header);
    const padding=parseFloat(style.paddingLeft)+parseFloat(style.paddingRight);
    const gap=parseFloat(style.columnGap)||0;
    const width=Math.min(innerWidth-20,Math.ceil(children.reduce((sum,el)=>sum+el.getBoundingClientRect().width,0)+padding+gap*(children.length-1)+2));
    header.style.setProperty('--quest-nav-hug-width',width+'px');
    header.style.setProperty('--quest-nav-left',Math.round((innerWidth-width)/2)+'px');
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure)};
  const init=()=>{
    header=document.querySelector('.header');
    if(!header)return;
    const observer=new MutationObserver(schedule);
    observer.observe(header,{attributes:true,attributeFilter:['class']});
    const resize=new ResizeObserver(schedule);
    ['.brand','.desktop-nav','.nav-book'].forEach(sel=>{const el=header.querySelector(sel);if(el)resize.observe(el)});
    desktop.addEventListener?.('change',schedule);
    addEventListener('resize',schedule,{passive:true});
    addEventListener('scroll',schedule,{passive:true});
    document.fonts?.ready.then(schedule);
    schedule();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();