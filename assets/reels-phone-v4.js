(() => {
  const init = () => {
    const section = document.querySelector('.reels-section');
    const reels = window.questReelsData;
    if (!section || !Array.isArray(reels) || reels.length === 0) return;
    section.classList.add('reels-phone-mode');
    section.innerHTML = '<img class="reels-phone-pattern" src="/quest-v2/assets/pattern-02.svg" alt="" aria-hidden="true">' +
      '<div class="reels-phone-content">' +
        '<header class="reels-phone-heading"><h2 id="reels-title">Quest Moments</h2><p>Real hotel experiences, in reels.</p></header>' +
        '<div class="reels-phone-stage">' +
          '<div class="reels-phone-slot reels-phone-slot--outer-left" data-slot="0"></div>' +
          '<div class="reels-phone-slot reels-phone-slot--inner-left" data-slot="1"></div>' +
          '<div class="reels-phone" aria-label="Highlighted Quest Moments video"><div class="reels-phone__edge"><div class="reels-phone__screen"><video id="reels-phone-video" muted playsinline loop preload="metadata"></video></div><span class="reels-phone__camera" aria-hidden="true"></span></div></div>' +
          '<div class="reels-phone-slot reels-phone-slot--inner-right" data-slot="2"></div>' +
          '<div class="reels-phone-slot reels-phone-slot--outer-right" data-slot="3"></div>' +
        '</div>' +
        '<div class="reels-phone-controls"><div class="reels-phone-dots" role="group" aria-label="Choose a Quest Moment"></div><button class="reels-phone-toggle" type="button" aria-label="Pause reel playback and automatic progression" aria-pressed="false">Pause</button><button class="reels-phone-play" type="button" aria-label="Play highlighted reel">Play video</button></div>' +
        '<p class="sr-only" role="status" aria-live="polite" id="reels-phone-status"></p>' +
      '</div>';
    const phone = section.querySelector('.reels-phone');
    const screen = section.querySelector('.reels-phone__screen');
    const video = section.querySelector('#reels-phone-video');
    const slots = [...section.querySelectorAll('[data-slot]')];
    const dots = section.querySelector('.reels-phone-dots');
    const toggle = section.querySelector('.reels-phone-toggle');
    const play = section.querySelector('.reels-phone-play');
    const status = section.querySelector('#reels-phone-status');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const visible = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting);
      syncPlayback();
    }, {threshold: .18}) : null;
    let inView = !visible;
    let active = 0;
    let stopped = false;
    let interacting = false;
    let changing = false;
    let timer = 0;
    let stopInteractionTimer = 0;
    const fallback = new Set(reels.map((reel, i) => reel.available === false ? i : -1).filter(i => i >= 0));
    const order = () => [3,4,1,2].map(step => (active + step) % reels.length);
    const pauseTimer = () => {clearTimeout(timer); timer = 0;};
    const canAuto = () => !stopped && !interacting && !reduced.matches && inView && !document.hidden;
    const syncPlayback = () => {
      if (inView && !stopped && !document.hidden) {
        if (!fallback.has(active)) video.play().then(() => {play.hidden = true;}).catch(() => {play.hidden = false;});
      } else video.pause();
      if (canAuto() && !changing) {
        pauseTimer();
        timer = setTimeout(() => select((active + 1) % reels.length), 25000);
      } else pauseTimer();
    };
    const previewMarkup = (index) => {
      const reel = reels[index];
      return '<button type="button" class="reels-phone-preview" data-reel="' + index + '" aria-label="Show ' + reel.accessibleLabel + '">' +
        '<span class="reels-phone-preview__rail" aria-hidden="true"></span>' +
        '<span class="reels-phone-preview__media"><video muted playsinline preload="metadata" poster="' + reel.posterSrc + '"' + (fallback.has(index) ? '' : ' src="' + reel.videoSrc + '"') + ' aria-hidden="true"></video></span>' +
        '<span class="reels-phone-preview__rail reels-phone-preview__rail--right" aria-hidden="true"></span>' +
      '</button>';
    };
    const renderPreviews = () => {
      order().forEach((index, slot) => {slots[slot].innerHTML = previewMarkup(index);});
      slots.forEach(slot => {
        const preview = slot.querySelector('video');
        preview?.addEventListener('error', () => {preview.removeAttribute('src'); preview.load();}, {once:true});
      });
    };
    const setPhone = () => {
      video.pause();
      video.removeAttribute('src');
      video.poster = reels[active].posterSrc;
      if (!fallback.has(active)) video.src = reels[active].videoSrc;
      video.load();
      video.setAttribute('aria-label', reels[active].accessibleLabel);
      status.textContent = 'Showing ' + reels[active].accessibleLabel + ', ' + (active + 1) + ' of ' + reels.length;
      [...dots.children].forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === active)));
      play.hidden = false;
      syncPlayback();
    };
    video.addEventListener('error', () => {
      fallback.add(active);
      video.removeAttribute('src');
      video.load();
      play.hidden = true;
    });
    video.addEventListener('playing', () => {play.hidden = true;});
    video.addEventListener('pause', () => {if (!fallback.has(active)) play.hidden = false;});
    const select = async (index, source) => {
      if (changing || index === active || !Number.isInteger(index) || index < 0 || index >= reels.length) return;
      changing = true;
      pauseTimer();
      const old = active;
      const from = source?.closest('.reels-phone-preview') || section.querySelector('.reels-phone-preview[data-reel="' + index + '"]');
      const motion = !reduced.matches && from && from.animate && window.innerWidth > 700;
      if (motion) {
        const a = from.getBoundingClientRect(), b = screen.getBoundingClientRect();
        const dx = b.left + b.width / 2 - (a.left + a.width / 2);
        const dy = b.top + b.height / 2 - (a.top + a.height / 2);
        const scale = Math.min(b.width / a.width, 1.4);
        from.style.zIndex = '6';
        try {await from.animate([
          {transform:'translate(0,0) scale(1)',opacity:1},
          {transform:'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')',opacity:.15}
        ], {duration:480,easing:'cubic-bezier(.22,1,.36,1)'}).finished;} catch (_) {}
      }
      screen.classList.add('is-changing');
      active = index;
      renderPreviews();
      setPhone();
      requestAnimationFrame(() => screen.classList.remove('is-changing'));
      if (motion) {
        const outgoing = [...section.querySelectorAll('.reels-phone-preview')].find(button => Number(button.dataset.reel) === old);
        if (outgoing) {
          const a = screen.getBoundingClientRect(), b = outgoing.getBoundingClientRect();
          const dx = a.left + a.width / 2 - (b.left + b.width / 2);
          const dy = a.top + a.height / 2 - (b.top + b.height / 2);
          outgoing.animate([
            {transform:'translate(' + dx + 'px,' + dy + 'px) scale(1.25)',opacity:.12},
            {transform:'translate(0,0) scale(1)',opacity:1}
          ], {duration:480,easing:'cubic-bezier(.22,1,.36,1)'});
        }
      }
      changing = false;
      syncPlayback();
    };
    dots.innerHTML = reels.map((reel, i) => '<button type="button" data-dot="' + i + '" aria-label="Show reel ' + (i + 1) + ' of ' + reels.length + '" aria-pressed="' + (i === 0) + '"></button>').join('');
    dots.addEventListener('click', event => {
      const dot = event.target.closest('[data-dot]');
      if (dot) select(Number(dot.dataset.dot), dot);
    });
    section.querySelector('.reels-phone-stage').addEventListener('click', event => {
      const preview = event.target.closest('[data-reel]');
      if (preview) select(Number(preview.dataset.reel), preview);
    });
    toggle.addEventListener('click', () => {
      stopped = !stopped;
      toggle.setAttribute('aria-pressed', String(stopped));
      toggle.setAttribute('aria-label', stopped ? 'Resume reel playback and automatic progression' : 'Pause reel playback and automatic progression');
      toggle.textContent = stopped ? 'Resume' : 'Pause';
      syncPlayback();
    });
    play.addEventListener('click', () => {
      if (fallback.has(active)) return;
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    });
    section.addEventListener('pointerenter', () => {interacting = true;syncPlayback();});
    section.addEventListener('pointerleave', () => {interacting = false;syncPlayback();});
    section.addEventListener('focusin', () => {clearTimeout(stopInteractionTimer);interacting = true;syncPlayback();});
    section.addEventListener('focusout', () => {
      stopInteractionTimer = setTimeout(() => {interacting = section.contains(document.activeElement);syncPlayback();}, 0);
    });
    document.addEventListener('visibilitychange', syncPlayback);
    reduced.addEventListener?.('change', syncPlayback);
    visible?.observe(section);
    renderPreviews();
    setPhone();

    const ribbon = document.querySelector('.social-ribbon');
    if (ribbon) {
      const labels = ['Quest Hotels','@quest_hotels','@QuestHotels','Archipelago Hotels'];
      ribbon.querySelectorAll('.social-ribbon__sequence').forEach(sequence => {
        [...sequence.querySelectorAll('.social-ribbon__item')].forEach((item, i) => {
          const label = item.querySelector('span');
          if (label) label.textContent = labels[i];
        });
      });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();