(() => {
  const init = () => {
    const section = document.querySelector('.membership-poster');
    if (!section) return false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return true;
    if ('IntersectionObserver' in window) {
      section.classList.add('motion-ready');
      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (entry.isIntersecting) section.classList.add('is-visible');
        else if (entry.boundingClientRect.top > window.innerHeight) section.classList.remove('is-visible');
      }, {threshold:.08});
      observer.observe(section);
    }
    let pending = false;
    const update = () => {
      pending = false;
      const rect = section.getBoundingClientRect();
      const start = rect.height * .56;
      const distance = Math.max(180, rect.height * .32);
      const progress = Math.max(0, Math.min(1, (-rect.top - start) / distance));
      section.style.setProperty('--member-copy-opacity', String(1 - progress * .32));
      section.style.setProperty('--member-visual-opacity', String(1 - progress * .26));
      section.style.setProperty('--member-copy-shift', (-progress * 26).toFixed(1) + 'px');
      section.style.setProperty('--member-visual-shift', (-progress * 20).toFixed(1) + 'px');
      section.style.setProperty('--member-pattern-shift', (-progress * 12).toFixed(1) + 'px');
    };
    const schedule = () => {if (!pending) {pending = true;requestAnimationFrame(update);}};
    window.addEventListener('scroll', schedule, {passive:true});
    window.addEventListener('resize', schedule, {passive:true});
    schedule();
    return true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else if (!init()) {
    const observer = new MutationObserver(() => {if (init()) observer.disconnect();});
    observer.observe(document.documentElement, {childList:true,subtree:true});
  }
})();