(() => {
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  if(!fine.matches||reduce.matches)return;
  const start=()=>{
    const head=document.createElement('div');
    const trail=document.createElement('div');
    head.className='quest-pattern-cursor';
    trail.className='quest-pattern-cursor__trail';
    head.setAttribute('aria-hidden','true');
    trail.setAttribute('aria-hidden','true');
    head.innerHTML='<span class="quest-pattern-cursor__tile quest-pattern-cursor__tile--quarter"></span><span class="quest-pattern-cursor__tile quest-pattern-cursor__tile--arrow"></span><span class="quest-pattern-cursor__tile quest-pattern-cursor__tile--sun"></span>';
    document.body.append(head,trail);
    let targetX=-100,targetY=-100,x=-100,y=-100,tailX=-100,tailY=-100,frame=0,visible=false;
    const paint=()=>{
      frame=0;
      x+=(targetX-x)*.25;
      y+=(targetY-y)*.25;
      tailX+=(x-tailX)*.16;
      tailY+=(y-tailY)*.16;
      head.style.transform='translate3d('+Math.round(x+13)+'px,'+Math.round(y+13)+'px,0)';
      trail.style.transform='translate3d('+Math.round(tailX+10)+'px,'+Math.round(tailY+14)+'px,0)';
      if(visible&&(Math.abs(targetX-x)>.2||Math.abs(targetY-y)>.2||Math.abs(x-tailX)>.2||Math.abs(y-tailY)>.2))frame=requestAnimationFrame(paint);
    };
    const queue=()=>{if(!frame)frame=requestAnimationFrame(paint)};
    const hide=()=>{visible=false;head.classList.remove('is-visible');trail.classList.remove('is-visible')};
    addEventListener('pointermove',event=>{
      if(event.pointerType==='touch')return;
      targetX=event.clientX;targetY=event.clientY;
      if(!visible){visible=true;x=targetX;y=targetY;tailX=x;tailY=y;head.classList.add('is-visible');trail.classList.add('is-visible')}
      queue();
    },{passive:true});
    document.addEventListener('pointerleave',hide);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
    reduce.addEventListener?.('change',()=>{if(reduce.matches){hide();head.remove();trail.remove();if(frame)cancelAnimationFrame(frame)}});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();