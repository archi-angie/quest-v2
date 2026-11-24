(() => {
  const init = () => {
    const section = document.querySelector('.reels-section');
    const reels = window.questReelsData;
    if (!section || !Array.isArray(reels) || reels.length === 0) return;
    section.classList.add('reels-phone-mode');
    section.innerHTML = '<img class="reels-pattern-block reels-pattern-block--left" src="/quest-v2/assets/reels-pattern-user-v2.svg" alt="" aria-hidden="true">' +
      '<img class="reels-pattern-block reels-pattern-block--right" src="/quest-v2/assets/reels-pattern-user-v2.svg" alt="" aria-hidden="true">' +
      '<div class="reels-phone-content">' +
        '<header class="reels-phone-heading"><h2 id="reels-title">Lorem Ipsum Dolor Sit</h2></header>' +
        '<div class="reels-phone-stage">' +
          '<div class="reels-phone-slot reels-phone-slot--outer-left" data-slot="0"></div>' +
          '<div class="reels-phone-slot reels-phone-slot--inner-left" data-slot="1"></div>' +
          '<div class="reels-phone" aria-label="Highlighted Quest Moments video"><div class="reels-phone__screen"><video id="reels-phone-video" muted playsinline loop preload="none"></video></div><img class="reels-phone__mockup" src="/quest-v2/assets/home-mockup.png" alt="" aria-hidden="true"><span class="reels-phone__island" aria-hidden="true"><i></i></span></div>' +
          '<div class="reels-phone-slot reels-phone-slot--inner-right" data-slot="2"></div>' +
          '<div class="reels-phone-slot reels-phone-slot--outer-right" data-slot="3"></div>' +
        '</div>' +
        '<div class="reels-phone-controls"><div class="reels-phone-dots" role="group" aria-label="Choose a Quest Moment"></div></div>' +
        '<p class="sr-only" role="status" aria-live="polite" id="reels-phone-status"></p>' +
      '</div>';
    const phone = section.querySelector('.reels-phone');
    const screen = section.querySelector('.reels-phone__screen');
    const video = section.querySelector('#reels-phone-video');
    const slots = [...section.querySelectorAll('[data-slot]')];
    const dots = section.querySelector('.reels-phone-dots');
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
    let wantPlayback = true;
    const requestPlay = () => {
      if (!wantPlayback || !inView || stopped || document.hidden || fallback.has(active)) return;
      video.muted = true;
      video.playsInline = true;
      const requestedIndex = active;
      const attempt = video.play();
      if (attempt?.then) attempt.catch(error => {
        if (active === requestedIndex && error?.name !== 'AbortError')
          status.textContent = 'Video preview is available; autoplay could not start.';
      });
    };
    const syncPlayback = () => {
      if (inView && !stopped && !document.hidden && !fallback.has(active)) {
        if (video.dataset.reel !== String(active)) {
          video.pause();
          video.src = reels[active].videoSrc;
          video.dataset.reel = String(active);
          video.preload = 'auto';
          video.load();
        }
        requestPlay();
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
        '<span class="reels-phone-preview__media"><img src="' + reel.posterSrc + '" alt="" loading="lazy" decoding="async"></span>' +
        '<span class="reels-phone-preview__rail reels-phone-preview__rail--right" aria-hidden="true"></span>' +
      '</button>';
    };
    const previewButtons = reels.map((_, index) => {
      const template = document.createElement('template');
      template.innerHTML = previewMarkup(index);
      return template.content.firstElementChild;
    });
    const renderPreviews = () => {
      order().forEach((index, slot) => slots[slot].replaceChildren(previewButtons[index]));
    };
    const setPhone = (start = true) => {
      video.pause();
      if (reels[active].posterSrc) video.poster = reels[active].posterSrc;
      else video.removeAttribute('poster');
      video.setAttribute('aria-label', reels[active].accessibleLabel);
      status.textContent = 'Showing ' + reels[active].accessibleLabel + ', ' + (active + 1) + ' of ' + reels.length;
      [...dots.children].forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === active)));
      wantPlayback = start;
      syncPlayback();
    };
    video.addEventListener('canplay', requestPlay);
    video.addEventListener('error', () => {
      fallback.add(active);
      wantPlayback = false;
      video.removeAttribute('src');
      delete video.dataset.reel;
      video.load();
      status.textContent = reels[active].accessibleLabel + ' could not load; its preview remains available.';
    });
    const select = async (index, source) => {
      if (changing || index === active || !Number.isInteger(index) || index < 0 || index >= reels.length) return;
      changing = true;
      pauseTimer();
      if (source) {
        stopped = false;
      }
      const oldRects = new Map([...section.querySelectorAll('.reels-phone-preview')].map(button => [Number(button.dataset.reel), button.getBoundingClientRect()]));
      const direction = source?.closest('.reels-phone-slot--outer-left,.reels-phone-slot--inner-left') ? -1 :
        source?.closest('.reels-phone-slot--outer-right,.reels-phone-slot--inner-right') ? 1 :
        ((index - active + reels.length) % reels.length <= reels.length / 2 ? 1 : -1);
      active = index;
      renderPreviews();
      setPhone(true);
      const motion = !reduced.matches && screen.animate && window.innerWidth > 700;
      const animations = [];
      if (motion) {
        animations.push(video.animate([
          {transform:'scale(1.07) translateX(' + (direction * 6) + 'px)',opacity:.78},
          {transform:'scale(1) translateX(0)',opacity:1}
        ], {duration:380,easing:'cubic-bezier(.22,1,.36,1)'}).finished);
        section.querySelectorAll('.reels-phone-preview').forEach(button => {
          const from = oldRects.get(Number(button.dataset.reel));
          const to = button.getBoundingClientRect();
          if (!from) return;
          const dx = from.left + from.width/2 - (to.left + to.width/2);
          const dy = from.top + from.height/2 - (to.top + to.height/2);
          if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
          animations.push(button.animate([
            {transform:'translate(' + dx + 'px,' + dy + 'px)',opacity:.82},
            {transform:'translate(0,0)',opacity:1}
          ], {duration:430,easing:'cubic-bezier(.22,1,.36,1)'}).finished);
        });
      }
      await Promise.allSettled(animations);
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
    section.addEventListener('pointerenter', () => {interacting = true;syncPlayback();});
    section.addEventListener('pointerleave', () => {interacting = false;syncPlayback();});
    section.addEventListener('focusin', () => {clearTimeout(stopInteractionTimer);interacting = true;syncPlayback();});
    section.addEventListener('focusout', () => {
      stopInteractionTimer = setTimeout(() => {interacting = section.contains(document.activeElement);syncPlayback();}, 0);
    });
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('resize', syncPlayback, {passive:true});
    reduced.addEventListener?.('change', syncPlayback);
    visible?.observe(phone);
    renderPreviews();
    setPhone();

    const ribbon = document.querySelector('.social-ribbon');
    if (ribbon) {
      section.insertAdjacentElement('afterend', ribbon);
      const labels = ['Quest Hotels','@quest_hotels','Archipelago Hotels'];
      ribbon.querySelectorAll('.social-ribbon__sequence').forEach(sequence => {
        [...sequence.querySelectorAll('.social-ribbon__item')].forEach((item, i) => {
          const label = item.querySelector('span');
          if (label) label.textContent = labels[i];
        });
      });
      const fillRibbon = () => {
        const track = ribbon.querySelector('.social-ribbon__track');
        const first = track?.querySelector('.social-ribbon__sequence');
        if (!first) return;
        [...track.children].slice(1).forEach(copy => copy.remove());
        const step = first.getBoundingClientRect().width;
        if (!step) return;
        track.style.setProperty('--social-step', step + 'px');
        const copies = Math.max(2, Math.ceil(ribbon.clientWidth / step) + 2);
        for (let i = 1; i < copies; i++) {
          const copy = first.cloneNode(true);
          copy.setAttribute('aria-hidden', 'true');
          copy.querySelectorAll('a').forEach(link => link.tabIndex = -1);
          track.append(copy);
        }
      };
      fillRibbon();
      if ('ResizeObserver' in window) new ResizeObserver(fillRibbon).observe(ribbon);
      else window.addEventListener('resize', fillRibbon, {passive:true});
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();