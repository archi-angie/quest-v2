(() => {
  const init = () => {
    const section = document.querySelector('.membership-redesign');
    if (!section) return false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return true;
    section.classList.add('motion-ready');
    let settleTimer;
    const observer = new IntersectionObserver(([entry]) => {
      const before = entry.boundingClientRect.top > window.innerHeight;
      if (entry.isIntersecting) {
        section.classList.add('is-visible', 'is-active');
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => section.classList.add('is-settled'), 1150);
      } else {
        section.classList.remove('is-active', 'is-settled');
        clearTimeout(settleTimer);
        if (before) section.classList.remove('is-visible');
      }
    }, {threshold: .08});
    observer.observe(section);
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
      section.style.setProperty('--member-wave-opacity', String(1 - leave * .15));
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