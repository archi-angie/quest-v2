/* Quest Moments media records. The five uploaded MP4 files are mapped here once copied into /assets. */
(() => {
  const asset = '/quest-v2/assets/';
  const reelsPage = 'https://www.instagram.com/quest_hotels/reels/';
  // Poster images remain visible if the uploaded MP4 assets have not been imported yet.
  const reels = [
    {id:'moment-1',video:asset+'quest-moment-01.mp4',poster:asset+'hero-pool.webp',offset:'-8px'},
    {id:'moment-2',video:asset+'quest-moment-02.mp4',poster:asset+'hero-breakfast.webp',offset:'18px'},
    {id:'moment-3',video:asset+'quest-moment-03.mp4',poster:asset+'hero-quality.webp',offset:'8px'},
    {id:'moment-4',video:asset+'quest-moment-04.mp4',poster:asset+'hero-memories.webp',offset:'28px'},
    {id:'moment-5',video:asset+'quest-moment-05.mp4',poster:asset+'hero-breakfast.webp',offset:'-10px'}
  ];
  const init = () => {
    const section = document.querySelector('.reels-section');
    if (!section) return;
    const upper = section.querySelector('.reels-lane--upper');
    const lower = section.querySelector('.reels-lane--lower');
    const upperTrack = section.querySelector('#reels-upper-track');
    const lowerTrack = section.querySelector('#reels-lower-track');
    const pagination = section.querySelector('#reels-pagination');
    const pause = section.querySelector('#reels-pause');
    const manual = matchMedia('(max-width: 700px), (hover: none), (prefers-reduced-motion: reduce)');
    let navigationTimer = 0;
    const card = (item,index,duplicate) => '<article class="reel-card" style="--reel-offset:'+item.offset+'" data-reel-index="'+index+'">'+
      '<button class="reel-frame" type="button" aria-label="Play Quest Moments video '+(index+1)+'"'+(duplicate?' tabindex="-1"':'')+'>'+
      '<span class="reel-frame__rail" aria-hidden="true"></span>'+
      '<span class="reel-media"><video muted playsinline loop preload="none" poster="'+item.poster+'" data-src="'+item.video+'"></video></span>'+
      '<span class="reel-frame__rail reel-frame__rail--right" aria-hidden="true"></span>'+
      '<span class="reel-corner reel-corner--tl" aria-hidden="true"></span>'+
      '<span class="reel-corner reel-corner--br" aria-hidden="true"></span></button></article>';
    const sequence = (indices,duplicate) => '<div class="reels-sequence" style="--slot-count:'+indices.length+'"'+(duplicate?' aria-hidden="true"':'')+'>'+indices.map(i=>card(reels[i],i,duplicate)).join('')+'</div>';
    upperTrack.innerHTML = sequence([0,1],false)+sequence([0,1],true);
    lowerTrack.innerHTML = sequence([2,3,4],false)+sequence([2,3,4],true);
    pagination.innerHTML = reels.map((item,index)=>'<button type="button" data-reel-dot="'+index+'" aria-label="Show Quest Moments video '+(index+1)+'" aria-pressed="'+(index===0)+'"></button>').join('');
    const dotButtons = [...pagination.querySelectorAll('button')];
    const lanes = [upper,lower];
    const tracks = [upperTrack,lowerTrack];
    const resize = () => lanes.forEach(lane=>lane.style.setProperty('--lane-width',lane.clientWidth+'px'));
    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(section);
    else window.addEventListener('resize',resize,{passive:true});
    const setActive = index => {
      dotButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
      section.querySelectorAll('.reel-card').forEach(card=>card.classList.toggle('is-active',Number(card.dataset.reelIndex)===index));
    };
    const motionOf = track => track.getAnimations().find(animation=>animation.animationName==='reelsLaneMove');
    const allVideos = [...section.querySelectorAll('video')];
    const loadVideo = video => {
      if (video.src || video.dataset.failed) return;
      video.src = video.dataset.src;
      video.load();
    };
    allVideos.forEach(video=>{
      video.addEventListener('error',()=>{
        video.dataset.failed = 'true';
        video.closest('.reel-frame').setAttribute('aria-label','Open Quest Hotels Reels on Instagram');
      });
    });
    if ('IntersectionObserver' in window) {
      const videosInView = new IntersectionObserver(entries=>entries.forEach(entry=>{
        const video = entry.target;
        if (entry.isIntersecting && !document.hidden && !manual.matches) {
          loadVideo(video);
          if (!video.dataset.failed) video.play().catch(()=>{});
        } else video.pause();
      }),{threshold:.3});
      allVideos.forEach(video=>videosInView.observe(video));
    }
    document.addEventListener('visibilitychange',()=>{if(document.hidden)allVideos.forEach(video=>video.pause())});
    section.addEventListener('click',event=>{
      const frame = event.target.closest('.reel-frame');
      if (!frame) return;
      const video = frame.querySelector('video');
      const index = Number(frame.closest('.reel-card').dataset.reelIndex);
      setActive(index);
      if (video.dataset.failed || video.networkState===HTMLMediaElement.NETWORK_NO_SOURCE) {
        window.open(reelsPage,'_blank','noopener,noreferrer');
        return;
      }
      loadVideo(video);
      if (video.paused) video.play().then(()=>frame.setAttribute('aria-label','Pause Quest Moments video '+(index+1))).catch(()=>{});
      else {video.pause();frame.setAttribute('aria-label','Play Quest Moments video '+(index+1));}
    });
    section.addEventListener('focusin',event=>{
      const frame = event.target.closest('.reel-frame');
      if (frame) setActive(Number(frame.closest('.reel-card').dataset.reelIndex));
    });
    const findCentered = () => {
      let best = {index:0,distance:Infinity};
      lanes.forEach(lane=>{
        const center = lane.getBoundingClientRect().left+lane.clientWidth/2;
        lane.querySelectorAll('.reel-card').forEach(card=>{
          const rect = card.getBoundingClientRect();
          const distance = Math.abs(rect.left+rect.width/2-center);
          if (distance<best.distance) best={index:Number(card.dataset.reelIndex),distance};
        });
      });
      return best.index;
    };
    const updateActive = () => {
      if (manual.matches || section.classList.contains('is-navigating') || section.matches(':focus-within')) return;
      setActive(findCentered());
    };
    setInterval(updateActive,400);
    const showReel = index => {
      const lane = index<2?upper:lower;
      const track = index<2?upperTrack:lowerTrack;
      const local = index<2?index:index-2;
      const count = index<2?2:3;
      setActive(index);
      if (manual.matches) {
        const target = lane.querySelector('.reels-sequence:not([aria-hidden]) .reel-card[data-reel-index="'+index+'"]');
        if (target) lane.scrollTo({left:Math.max(0,target.offsetLeft-lane.clientWidth/2+target.clientWidth/2),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
        target?.querySelector('.reel-frame')?.focus({preventScroll:true});
        return;
      }
      section.classList.add('is-navigating');
      const phase = (((local+.5)/count-.5)%1+1)%1;
      tracks.forEach(item=>{
        const motion = motionOf(item);
        const duration = parseFloat(getComputedStyle(item).animationDuration)*1000;
        if (motion && duration) motion.currentTime = duration*phase;
      });
      clearTimeout(navigationTimer);
      navigationTimer = setTimeout(()=>section.classList.remove('is-navigating'),7000);
    };
    pagination.addEventListener('click',event=>{
      const button = event.target.closest('[data-reel-dot]');
      if (button) showReel(Number(button.dataset.reelDot));
    });
    pause.addEventListener('click',()=>{
      const paused = section.classList.toggle('is-paused');
      pause.setAttribute('aria-pressed',String(paused));
      pause.setAttribute('aria-label',paused?'Play moving Quest Moments cards':'Pause moving Quest Moments cards');
      pause.innerHTML = '<span aria-hidden="true">'+(paused?'▶':'Ⅱ')+'</span>';
    });
    lanes.forEach(lane=>lane.addEventListener('scroll',()=>{
      if (!manual.matches) return;
      const center = lane.getBoundingClientRect().left+lane.clientWidth/2;
      const cards = [...lane.querySelectorAll('.reels-sequence:not([aria-hidden]) .reel-card')];
      cards.sort((a,b)=>Math.abs(a.getBoundingClientRect().left+a.clientWidth/2-center)-Math.abs(b.getBoundingClientRect().left+b.clientWidth/2-center));
      if (cards[0]) setActive(Number(cards[0].dataset.reelIndex));
    },{passive:true}));
    manual.addEventListener?.('change',()=>{resize();section.classList.remove('is-navigating');clearTimeout(navigationTimer);setActive(0)});
    const ribbon = document.querySelector('.social-ribbon');
    ribbon?.addEventListener('focusin',()=>{
      const motion = ribbon.querySelector('.social-ribbon__track')?.getAnimations()[0];
      if (motion) motion.currentTime = 0;
    });
  };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();