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
    const children=[header.querySelector('.brand'),header.querySelector('.desktop-nav'),header.querySelector('.nav-membership'),header.querySelector('.nav-book')].filter(el=>el&&getComputedStyle(el).display!=='none');
    if(children.length<3)return;
    const style=getComputedStyle(header);
    const padding=parseFloat(style.paddingLeft)+parseFloat(style.paddingRight);
    const gap=parseFloat(style.columnGap)||0;
    const contentWidth=children.reduce((sum,el)=>{const item=getComputedStyle(el);return sum+el.getBoundingClientRect().width+(parseFloat(item.marginLeft)||0)+(parseFloat(item.marginRight)||0)},0);
    const width=Math.min(innerWidth-20,Math.ceil(contentWidth+padding+gap*(children.length-1)+2));
    header.style.setProperty('--quest-nav-hug-width',width+'px');
    header.style.setProperty('--quest-nav-left',Math.round((innerWidth-width)/2)+'px');
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure)};
  const init=()=>{
    header=document.querySelector('.header');
    if(!header)return;
    const book=header.querySelector('.nav-book');
    if(book&&!header.querySelector('.nav-membership')){
      const membership=document.createElement('a');
      membership.className='nav-membership';
      membership.href='#membership';
      membership.setAttribute('aria-label','Archipelago Membership');
      const logo=document.createElement('img');
      logo.src='/quest-v2/assets/quest-mobile-membership-mark.svg';
      logo.alt='Archipelago Membership';
      membership.append(logo);
      header.insertBefore(membership,book);
      logo.addEventListener('load',schedule,{once:true});
    }
    const observer=new MutationObserver(schedule);
    observer.observe(header,{attributes:true,attributeFilter:['class']});
    const resize=new ResizeObserver(schedule);
    ['.brand','.desktop-nav','.nav-membership','.nav-book'].forEach(sel=>{const el=header.querySelector(sel);if(el)resize.observe(el)});
    desktop.addEventListener?.('change',schedule);
    addEventListener('resize',schedule,{passive:true});
    addEventListener('scroll',schedule,{passive:true});
    document.fonts?.ready.then(schedule);
    schedule();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();