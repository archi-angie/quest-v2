/* Quest Reels placeholders. Replace these records with verified Instagram media and post URLs when available. */
(() => {
  const asset = '/quest-v2/assets/';
  const reelsPage = 'https://www.instagram.com/quest_hotels/reels/';
  const reels = [
    {id:'pool',title:'Pool days together',image:asset+'hero-pool.webp',alt:'Family laughing together in a hotel pool',offset:'28px',kind:'placeholder',href:null},
    {id:'quality',title:'Time for the little moments',image:asset+'hero-quality.webp',alt:'Mother and daughter smiling together',offset:'-4px',kind:'placeholder',href:null},
    {id:'breakfast',title:'Breakfast, together',image:asset+'hero-breakfast.webp',alt:'Breakfast served with pancakes and fruit',offset:'40px',kind:'placeholder',href:null},
    {id:'memories',title:'A day to remember',image:asset+'hero-memories.webp',alt:'Family enjoying time together outdoors',offset:'8px',kind:'placeholder',href:null},
    {id:'rest',title:'Room to recharge',image:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=85',alt:'Warm hotel bedroom prepared for a stay',offset:'32px',kind:'placeholder',href:null}
  ];
  const init = () => {
    const stage = document.querySelector('#reels-stage');
    if (!stage) return;
    const track = stage.querySelector('#reels-track');
    const viewport = stage.querySelector('#reels-viewport');
    const dots = stage.querySelector('#reels-pagination');
    const pause = stage.querySelector('#reels-pause');
    const manual = matchMedia('(max-width: 800px), (hover: none), (prefers-reduced-motion: reduce)');
    let manualTimer = 0;
    let current = 0;
    const card = (item,index,duplicate) => {
      const destination = item.href || reelsPage;
      const label = item.href ? 'Open '+item.title+' on Instagram' : 'Browse Quest Hotels Reels on Instagram. '+item.title+' is an illustrative preview.';
      return '<article class="reel-card" style="--reel-y:'+item.offset+'" data-reel-index="'+index+'">'+
        '<div class="reel-frame"><span class="reel-frame__rail" aria-hidden="true"></span>'+
        '<div class="reel-media"><img src="'+item.image+'" alt="'+(duplicate?'':item.alt)+'" loading="lazy">'+
        '<a class="reel-play" href="'+destination+'" target="_blank" rel="noopener noreferrer" aria-label="'+(duplicate?'':label)+'"'+(duplicate?' tabindex="-1"':'')+'><span aria-hidden="true">▶</span></a>'+
        '<span class="reel-preview-label">Preview</span></div>'+
        '<span class="reel-frame__rail" aria-hidden="true"></span>'+
        '<span class="reel-corner reel-corner--tl" aria-hidden="true"></span><span class="reel-corner reel-corner--br" aria-hidden="true"></span></div>'+
        '<div class="reel-caption"><span>Quest Moment 0'+(index+1)+'</span><strong>'+item.title+'</strong></div></article>';
    };
    const sequence = duplicate => '<div class="reels-sequence"'+(duplicate?' aria-hidden="true"':'')+'>'+reels.map((item,index)=>card(item,index,duplicate)).join('')+'</div>';
    track.innerHTML = sequence(false)+sequence(true);
    track.querySelectorAll('.reel-media img').forEach(image=>image.addEventListener('error',()=>{image.src=asset+'hero-quality.webp'},{once:true}));
    dots.innerHTML = reels.map((item,index)=>'<button type="button" aria-label="Show reel '+(index+1)+': '+item.title+'" aria-pressed="'+(index===0)+'" data-reel-dot="'+index+'"></button>').join('');
    const primary = track.querySelector('.reels-sequence');
    const dotButtons = [...dots.querySelectorAll('button')];
    const setActive = index => {
      current = ((index % reels.length)+reels.length)%reels.length;
      dotButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));
    };
    const animation = () => track.getAnimations().find(item => item.animationName === 'reelsConveyor');
    const measure = () => ({
      sequenceWidth:primary.getBoundingClientRect().width,
      cardWidth:primary.querySelector('.reel-card').getBoundingClientRect().width,
      viewportWidth:viewport.getBoundingClientRect().width
    });
    const updateFromMotion = () => {
      if (manual.matches) {
        const {sequenceWidth,cardWidth,viewportWidth} = measure();
        const step = sequenceWidth/reels.length;
        setActive(Math.round((viewport.scrollLeft+viewportWidth/2-cardWidth/2)/step));
        return;
      }
      const motion = animation();
      if (!motion || motion.currentTime == null) return;
      const {sequenceWidth,cardWidth,viewportWidth} = measure();
      const duration = parseFloat(getComputedStyle(track).animationDuration)*1000;
      if (!sequenceWidth || !duration) return;
      const offset = ((Number(motion.currentTime)%duration)+duration)%duration/duration*sequenceWidth;
      setActive(Math.round((offset+viewportWidth/2-cardWidth/2)/(sequenceWidth/reels.length)));
    };
    const goTo = index => {
      setActive(index);
      const {sequenceWidth,cardWidth,viewportWidth} = measure();
      const step = sequenceWidth/reels.length;
      const target = index*step+cardWidth/2-viewportWidth/2;
      if (manual.matches) {
        viewport.scrollTo({left:Math.max(0,target),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
        return;
      }
      const motion = animation();
      const duration = parseFloat(getComputedStyle(track).animationDuration)*1000;
      if (motion && duration && sequenceWidth) {
        stage.classList.add('is-navigating');
        motion.currentTime = (((target%sequenceWidth)+sequenceWidth)%sequenceWidth)/sequenceWidth*duration;
        clearTimeout(manualTimer);
        manualTimer = setTimeout(()=>stage.classList.remove('is-navigating'),7000);
      }
    };
    dots.addEventListener('click',event=>{
      const button = event.target.closest('[data-reel-dot]');
      if (button) goTo(Number(button.dataset.reelDot));
    });
    pause.addEventListener('click',()=>{
      const paused = stage.classList.toggle('is-paused');
      pause.setAttribute('aria-pressed',String(paused));
      pause.setAttribute('aria-label',paused?'Play reel conveyor':'Pause reel conveyor');
      pause.innerHTML = paused ? 'Play <span aria-hidden="true">▶</span>' : 'Pause <span aria-hidden="true">Ⅱ</span>';
    });
    viewport.addEventListener('scroll',()=>{if(manual.matches) requestAnimationFrame(updateFromMotion)},{passive:true});
    setInterval(updateFromMotion,350);
    manual.addEventListener?.('change',()=>{stage.classList.remove('is-navigating');clearTimeout(manualTimer);setActive(0)});
    const ribbon = document.querySelector('.social-ribbon');
    ribbon?.addEventListener('focusin',()=>{
      const motion = ribbon.querySelector('.social-ribbon__track')?.getAnimations()[0];
      if (motion) motion.currentTime = 0;
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();