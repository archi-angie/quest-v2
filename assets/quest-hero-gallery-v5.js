(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const html = document.documentElement;
  const app = document.getElementById('app');
  let mounted = false;
  const mount = () => {
    if (mounted) return true;
    const gallery = document.querySelector('.hero .hero-gallery');
    const originals = [...(gallery?.querySelectorAll('.gallery-sequence:first-child .marquee-photo img') || [])];
    if (!gallery || originals.length < 2) return false;
    mounted = true;
    const originalTrack = gallery.firstElementChild;
    try {
      const data = originals.map(img => ({src:img.getAttribute('src'),alt:img.getAttribute('alt') || 'Quest hotel moment'}));
      const stage = document.createElement('div');
      stage.className = 'qhc-stage';
      stage.setAttribute('aria-hidden','true');
      const sr = document.createElement('ul');
      sr.className = 'qhc-sr';
      data.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.alt;
        sr.append(li);
      });
      const count = data.length * 3;
      const mid = Math.floor(count / 2);
      const cards = [];
      for (let i=0;i<count;i++) {
        const item = data[i % data.length];
        const card = document.createElement('div');
        card.className = 'qhc-card';
        const visual = document.createElement('div');
        visual.className = 'qhc-card-visual';
        visual.style.setProperty('--qhc-delay',String(Math.min(500,Math.abs(i-mid)*75)));
        const face = document.createElement('div');
        face.className = 'qhc-face';
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = '';
        img.decoding = 'async';
        img.loading = Math.abs(i-mid)<5 ? 'eager' : 'lazy';
        face.append(img);
        const reflection = document.createElement('div');
        reflection.className = 'qhc-reflection';
        const reflected = document.createElement('img');
        reflected.src = item.src;
        reflected.alt = '';
        reflected.decoding = 'async';
        reflected.loading = 'lazy';
        reflection.append(reflected);
        visual.append(face,reflection);
        card.append(visual);
        stage.append(card);
        cards.push({card,visual});
      }
      gallery.replaceChildren(stage,sr);
      gallery.classList.add('qhc');
      gallery.tabIndex = 0;
      gallery.setAttribute('aria-roledescription','carousel');
      gallery.setAttribute('aria-label','Quest hotel moments, drifting image carousel. Use left and right arrow keys to browse.');
      let width=0, cardWidth=0, span=0, progress=0, last=0, frame=0;
      let visible=false, entered=false, dragging=false, lastX=0, lastPointerTime=0, velocity=0, snapTarget=null, wheelTimer=0;
      const measure = () => {
        width = gallery.clientWidth;
        const heightCap = innerWidth > 700 ? innerHeight*.19 : 196;
        cardWidth = Math.max(128,Math.min(196,width*.16,heightCap));
        span = cardWidth+Math.min(24,Math.max(16,width*.021));
        const cardHeight = cardWidth/.77;
        const hugHeight = Math.ceil(cardHeight+(innerWidth<=700?50:68))+'px';
        if (gallery.style.height !== hugHeight) gallery.style.height = hugHeight;
        cards.forEach(({card}) => {
          card.style.width = cardWidth+'px';
          card.style.height = cardHeight+'px';
        });
        render();
      };
      const render = () => {
        if (!span || !width) return;
        const period = count*span;
        const perspective = 900;
        const curve = .07;
        cards.forEach(({card},i) => {
          const raw = (i-mid)*span+progress;
          const x = ((raw+period/2)%period+period)%period-period/2;
          const u = x/span;
          const distance = Math.abs(u);
          if (distance > 3.25) {
            card.style.visibility = 'hidden';
            return;
          }
          card.style.visibility = 'visible';
          const side = Math.sign(u);
          const angle = -side*Math.min(36,distance*15)*Math.PI/180;
          const depth = -28*Math.min(distance,3.5)**2;
          const center = side*(30*distance+cardWidth/Math.sqrt(curve)*Math.atan(distance*Math.sqrt(curve))+2*distance**3);
          const worldX = center*(perspective-depth)/perspective;
          card.style.transform = 'translate3d(calc(-50% + '+worldX.toFixed(2)+'px),0,'+depth.toFixed(2)+'px) rotateY('+(angle*180/Math.PI).toFixed(2)+'deg)';
          card.style.zIndex = String(Math.round(1000-distance*100));
        });
      };
      const stop = () => {if(frame)cancelAnimationFrame(frame);frame=0;last=0;};
      const step = now => {
        frame=0;
        const dt = Math.min(50,Math.max(0,now-last));
        last=now;
        if (!dragging) {
          if (snapTarget !== null) {
            progress += (snapTarget-progress)*Math.min(1,dt/120);
            if (Math.abs(snapTarget-progress)<.5) {progress=snapTarget;snapTarget=null;}
          } else if (!reduce.matches) {
            progress += span*.22*dt/1000;
          }
        }
        render();
        if (visible && entered && document.visibilityState==='visible' && !reduce.matches) frame=requestAnimationFrame(step);
      };
      const start = () => {
        if (frame || !visible || !entered || document.visibilityState!=='visible' || reduce.matches) return;
        last=performance.now();
        frame=requestAnimationFrame(step);
      };
      const enter = () => {
        if (entered) return;
        entered=true;
        gallery.classList.add('is-entering');
        start();
      };
      const onClass = () => {
        if (html.classList.contains('quest-show-gallery') || !html.classList.contains('quest-splash-pending')) enter();
      };
      const splashObserver = new MutationObserver(onClass);
      splashObserver.observe(html,{attributes:true,attributeFilter:['class']});
      onClass();
      if (!entered) setTimeout(onClass,7000);
      const visibility = new IntersectionObserver(entries => {
        visible=entries[0]?.isIntersecting || false;
        if (visible) start(); else stop();
      },{threshold:.05});
      visibility.observe(gallery);
      document.addEventListener('visibilitychange',() => {if (document.visibilityState==='visible') start(); else stop();});
      const resize = new ResizeObserver(measure);
      resize.observe(gallery);
      measure();
      gallery.addEventListener('pointerdown',e => {
        if (e.button!==0) return;
        dragging=true;snapTarget=null;lastX=e.clientX;lastPointerTime=performance.now();velocity=0;
        gallery.classList.add('is-dragging');
        gallery.setPointerCapture(e.pointerId);
      });
      gallery.addEventListener('pointermove',e => {
        if (!dragging) return;
        const now=performance.now(),dx=e.clientX-lastX,dt=Math.max(1,now-lastPointerTime);
        progress+=dx;velocity=.7*velocity+.3*(dx/dt);
        lastX=e.clientX;lastPointerTime=now;render();
      });
      const release = e => {
        if (!dragging) return;
        dragging=false;
        gallery.classList.remove('is-dragging');
        if (gallery.hasPointerCapture(e.pointerId)) gallery.releasePointerCapture(e.pointerId);
        snapTarget=Math.round((progress+velocity*120)/span)*span;
        if (reduce.matches) {progress=snapTarget;snapTarget=null;render();} else start();
      };
      gallery.addEventListener('pointerup',release);
      gallery.addEventListener('pointercancel',release);
      gallery.addEventListener('wheel',e => {
        progress-=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*.32;
        snapTarget=null;render();
        clearTimeout(wheelTimer);
        wheelTimer=setTimeout(() => {snapTarget=Math.round(progress/span)*span;start();},180);
      },{passive:true});
      gallery.addEventListener('keydown',e => {
        if (e.key!=='ArrowLeft' && e.key!=='ArrowRight') return;
        e.preventDefault();
        snapTarget=Math.round(progress/span)*span+(e.key==='ArrowLeft'?span:-span);
        if (reduce.matches) {progress=snapTarget;snapTarget=null;render();} else start();
      });
      reduce.addEventListener('change',() => {if (reduce.matches) {stop();render();} else start();});
      return true;
    } catch (_) {
      gallery.classList.remove('qhc');
      if (originalTrack) gallery.replaceChildren(originalTrack);
      return true;
    }
  };
  if (mount()) return;
  const observer = new MutationObserver(() => {if(mount())observer.disconnect();});
  if (app) observer.observe(app,{childList:true,subtree:true});
  setTimeout(() => observer.disconnect(),8000);
})();