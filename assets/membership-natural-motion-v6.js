(() => {
  const init = () => {
    const section = document.querySelector('.membership-redesign');
    if (!section) return false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pathGroups = ['tl', 'tr', 'bl', 'br'].map(side =>
      [...section.querySelectorAll('.membership-wave-' + side + ' path')]);
    const [tl, tr, bl, br] = pathGroups;
    const n = value => Math.round(value * 10) / 10;
    const wave = (time, period, offset, height) =>
      n(Math.sin(time * Math.PI * 2 / period + offset) * height);
    let frameId = 0;
    let lastPaint = 0;
    let inView = false;
    let settleTimer;
    const paint = timeStamp => {
      frameId = 0;
      if (!inView || reduce.matches || document.hidden) return;
      if (timeStamp - lastPaint >= 16) {
        lastPaint = timeStamp;
        const t = timeStamp / 1000;
        const a = wave(t, 12.5, 0, 8);
        const b = wave(t, 12.5, 1.8, 7);
        const c = wave(t, 15.2, .8, 8);
        const d = wave(t, 15.2, 2.5, 7);
        const e = wave(t, 17.3, 1.4, 8);
        const f = wave(t, 17.3, 3.1, 7);
        const g = wave(t, 14.6, 2.2, 8);
        const h = wave(t, 14.6, 4, 7);
        if (tl[0]) tl[0].setAttribute('d', `M0 107 C170 122 307 148 470 144 C395 ${n(165+a)} 330 ${n(174+b)} 260 ${n(176+a)} C160 ${n(180+b)} 72 ${n(217+a)} 0 260 Z`);
        if (tr[0]) tr[0].setAttribute('d', `M0 212 C101 ${n(97+c)} 190 ${n(67+d)} 283 ${n(91+c)} C401 ${n(122+d)} 491 ${n(94+c)} 590 0 V91 C494 ${n(174+d)} 411 ${n(190+c)} 289 ${n(150+d)} C188 ${n(118+c)} 105 ${n(136+d)} 0 212 Z`);
        if (tr[1]) tr[1].setAttribute('d', `M0 225 C98 ${n(122+d)} 184 ${n(111+c)} 286 ${n(140+d)} C411 ${n(179+c)} 500 ${n(137+d)} 590 63 V106 C495 ${n(189+c)} 414 ${n(205+d)} 281 ${n(166+c)} C187 ${n(139+d)} 99 ${n(150+c)} 0 225 Z`);
        if (bl[0]) bl[0].setAttribute('d', `M0 31 C135 ${n(2+e)} 176 ${n(102+f)} 290 ${n(151+e)} C407 ${n(204+f)} 543 ${n(117+e)} 690 250 H0 Z`);
        if (bl[1]) bl[1].setAttribute('d', `M0 65 C130 ${n(29+f)} 183 ${n(118+e)} 301 ${n(177+f)} C423 ${n(235+e)} 549 ${n(147+f)} 690 250 H0 V65 Z`);
        if (bl[2]) bl[2].setAttribute('d', `M0 148 C116 ${n(110+e)} 205 ${n(202+f)} 325 ${n(224+e)} C444 ${n(244+f)} 567 ${n(188+e)} 690 250 H0 Z`);
        if (br[0]) br[0].setAttribute('d', `M0 240 C112 ${n(150+g)} 196 ${n(181+h)} 285 ${n(165+g)} C421 ${n(143+h)} 511 ${n(26+g)} 690 61 V240 Z`);
        if (br[1]) br[1].setAttribute('d', `M0 240 C108 ${n(188+h)} 196 ${n(210+g)} 292 ${n(193+h)} C436 ${n(169+g)} 537 ${n(54+h)} 690 93 V240 Z`);
        if (br[2]) br[2].setAttribute('d', `M0 240 C131 ${n(212+g)} 227 ${n(225+h)} 327 ${n(207+g)} C458 ${n(181+h)} 554 ${n(107+g)} 690 141 V240 Z`);
      }
      frameId = requestAnimationFrame(paint);
    };
    const start = () => {
      if (!frameId && inView && !reduce.matches && !document.hidden)
        frameId = requestAnimationFrame(paint);
    };
    const stop = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    };
    if (!reduce.matches) section.classList.add('motion-ready');
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) {
        section.classList.add('is-visible', 'is-active');
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => section.classList.add('is-settled'), 1150);
        start();
      } else {
        section.classList.remove('is-active', 'is-settled');
        clearTimeout(settleTimer);
        stop();
        // Retain the settled entrance state on reverse scrolling; the active motion still pauses.
      }
    }, {threshold:.08});
    observer.observe(section);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    reduce.addEventListener('change', () => {
      section.classList.toggle('motion-ready', !reduce.matches);
      if (reduce.matches) stop(); else start();
    });
    let pending = false;
    const update = () => {
      pending = false;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      const leave = Math.max(0, Math.min(1, (viewport * .55 - rect.bottom) / (viewport * .28)));
      section.style.setProperty('--member-headline-shift', (-leave * 18).toFixed(1) + 'px');
      section.style.setProperty('--member-visual-shift', (-leave * 16).toFixed(1) + 'px');
      section.style.setProperty('--member-copy-shift', (-leave * 21).toFixed(1) + 'px');
      section.style.setProperty('--member-visual-opacity', String(1 - leave * .18));
      section.style.setProperty('--member-copy-opacity', String(1 - leave * .25));
      section.style.setProperty('--member-pattern-shift', (-leave * 10).toFixed(1) + 'px');
    };
    const schedule = () => {if (!pending) {pending = true;requestAnimationFrame(update)}};
    window.addEventListener('scroll', schedule, {passive:true});
    window.addEventListener('resize', schedule, {passive:true});
    schedule();
    return true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => {if (!init()) waitForSection()}, {once:true});
  else if (!init()) waitForSection();
  function waitForSection() {
    const observer = new MutationObserver(() => {if (init()) observer.disconnect()});
    observer.observe(document.documentElement, {childList:true,subtree:true});
  }
})();