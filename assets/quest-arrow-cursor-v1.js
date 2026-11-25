(() => {
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(!fine.matches||reduced.matches)return;
  const init=()=>{
    const cursor=document.createElement('div');
    cursor.className='quest-arrow-cursor';
    cursor.dataset.ink='yellow';
    cursor.setAttribute('aria-hidden','true');
    cursor.innerHTML=`<svg viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <path id="quest-arrow-shape" d="M3 3 46 29 29 33 39 51 Q41 54 38 56 L33 59 Q30 60 28 56 L18 38 6 48 Z"/>
        <clipPath id="quest-arrow-clip"><use href="#quest-arrow-shape"/></clipPath>
        <filter id="quest-arrow-purple" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".18 .25 .05 0 .22 .07 .14 .02 0 .04 .20 .22 .08 0 .30 0 0 0 1 0"/></filter>
        <filter id="quest-arrow-yellow" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".08 .08 .01 0 .84 .12 .15 .01 0 .54 0 0 0 0 .03 0 0 0 1 0"/></filter>
      </defs>
      <use href="#quest-arrow-shape" fill="#fff"/>
      <g clip-path="url(#quest-arrow-clip)">
        <image class="quest-arrow-cursor__purple" href="/quest-v2/assets/pattern-02.svg" x="-7" y="-10" width="80" height="120" filter="url(#quest-arrow-purple)"/>
        <image class="quest-arrow-cursor__yellow" href="/quest-v2/assets/pattern-02.svg" x="-7" y="-10" width="80" height="120" filter="url(#quest-arrow-yellow)"/>
      </g>
      <use href="#quest-arrow-shape" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M8 9 27 20" fill="none" stroke="#fff" stroke-opacity=".82" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`;
    document.body.append(cursor);
    let x=-100,y=-100,queued=false,visible=false;
    const interactive='a,button,input,textarea,select,label,summary,[role="button"],[contenteditable="true"],[draggable="true"]';
    const rgb=color=>{
      const m=color?.match(/rgba?\(([^)]+)\)/);
      if(!m)return null;
      const p=m[1].split(/[ ,/]+/).map(Number);
      return p.length>=3&&p.slice(0,3).every(Number.isFinite)&&p[3]!==0?p:null;
    };
    const inkAt=(node)=>{
      let nearest=null;
      for(let el=node;el&&el.nodeType===1;el=el.parentElement){
        const style=getComputedStyle(el);
        const color=rgb(style.backgroundColor);
        if(color){
          const [r,g,b]=color;
          if(r>155&&g>95&&b<115&&r>g*1.15)return 'purple';
          if(r>65&&b>65&&g<r*.82&&g<b*.82)return 'yellow';
          if(!nearest&&r>220&&g>220&&b>220)nearest='purple';
        }
      }
      return nearest||'yellow';
    };
    const draw=()=>{
      queued=false;
      cursor.style.transform='translate3d('+Math.round(x-2)+'px,'+Math.round(y-2)+'px,0)';
    };
    const move=e=>{
      if(e.pointerType==='touch')return;
      x=e.clientX;y=e.clientY;
      const under=document.elementFromPoint(x,y);
      const target=under?.closest(interactive);
      if(target){
        cursor.classList.remove('is-visible');
        document.documentElement.classList.remove('quest-arrow-active');
        visible=false;
      }else{
        cursor.dataset.ink=inkAt(under);
        if(!visible){cursor.classList.add('is-visible');document.documentElement.classList.add('quest-arrow-active');visible=true}
      }
      if(!queued){queued=true;requestAnimationFrame(draw)}
    };
    const hide=()=>{visible=false;cursor.classList.remove('is-visible');document.documentElement.classList.remove('quest-arrow-active')};
    addEventListener('pointermove',move,{passive:true});
    document.addEventListener('pointerleave',hide);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
    reduced.addEventListener?.('change',()=>{if(reduced.matches){hide();cursor.remove();removeEventListener('pointermove',move)}});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();