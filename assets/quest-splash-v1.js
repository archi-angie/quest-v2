(() => {
  const html = document.documentElement;
  const splash = document.getElementById('quest-splash');
  if (!splash || !html.classList.contains('quest-splash-pending')) {
    splash?.remove();
    return;
  }
  const app = document.getElementById('app');
  const logo = splash.querySelector('.quest-splash-logo');
  const logoImage = logo.querySelector('img');
  const composition = splash.querySelector('.quest-splash-composition');
  const skip = splash.querySelector('.quest-splash-skip');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const timers = [];
  const animations = [];
  let finished = false;
  let started = false;
  let observing;
  const later = (fn, ms) => timers.push(setTimeout(() => {if (!finished) fn()}, ms));
  const clear = () => {
    timers.forEach(clearTimeout);
    if (observing) observing.disconnect();
    if (window.__questSplashWatchdog) clearTimeout(window.__questSplashWatchdog);
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    clear();
    animations.forEach(animation => {try {animation.cancel()} catch (_) {}});
    app?.removeAttribute('inert');
    html.classList.remove('quest-splash-pending','quest-show-corners','quest-show-headline','quest-show-gallery','quest-show-booking','quest-show-nav','quest-show-logo');
    splash.remove();
  };
  skip.addEventListener('click', finish);
  const onKey = event => {if (event.key === 'Escape') finish()};
  document.addEventListener('keydown', onKey);
  const onReduce = () => {if (reduce.matches) finish()};
  reduce.addEventListener('change', onReduce);
  logoImage.addEventListener('error', finish, {once:true});
  window.addEventListener('pagehide', finish, {once:true});
  const animate = (node, keyframes, options) => {
    const a = node.animate(keyframes, options);
    animations.push(a);
    return a;
  };
  const transform = (x, y, angle, scale) =>
    `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${angle.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
  const boot = () => {
    if (started) return true;
    if (finished || reduce.matches) {finish(); return true;}
    if (logoImage.complete && !logoImage.naturalWidth) {finish(); return true;}
    if (scrollY > 24 || location.hash) {finish(); return true;}
    const navLogo = document.querySelector('.header .logo-light');
    const hero = document.querySelector('.hero');
    const corners = [...document.querySelectorAll('.hero-corner')];
    if (!navLogo || !hero || corners.length < 4) return false;
    started = true;
    app?.setAttribute('inert','');
    try {sessionStorage.setItem('quest-splash-played-v1','1')} catch (_) {}
    const vw = innerWidth, vh = innerHeight;
    const ringX = Math.min(vw * .38, 330);
    const ringY = Math.min(vh * .24, 215);
    const angles = [-162,-126,-90,-54,-18,18,54,90,126,162];
    const pieces = angles.map((degrees, index) => {
      const piece = document.createElement('img');
      piece.className = 'quest-splash-piece';
      piece.alt = '';
      piece.setAttribute('aria-hidden','true');
      piece.src = '/quest-v2/assets/quest-splash-piece-' + String(index + 1).padStart(2,'0') + '.svg';
      piece.decoding = 'async';
      piece.addEventListener('error', () => piece.remove(), {once:true});
      const size = Math.min(82, Math.max(38, vw * .052)) * ([1, .82, .96, .88, 1.08, .82, .94, 1, .85, .92][index]);
      piece.style.setProperty('--piece-size', size.toFixed(1) + 'px');
      composition.append(piece);
      const theta = degrees * Math.PI / 180;
      const x = Math.cos(theta) * ringX;
      const y = Math.sin(theta) * ringY;
      const edgeX = Math.cos(theta) * (vw * .62 + size);
      const edgeY = Math.sin(theta) * (vh * .68 + size);
      const corner = corners[index % corners.length].getBoundingClientRect();
      const targetX = corner.left + corner.width * (.28 + (index % 3) * .21) - vw / 2;
      const targetY = corner.top + corner.height * (.3 + (index % 2) * .32) - vh / 2;
      const tilt = (index % 2 ? 1 : -1) * (11 + index * 2);
      animate(piece, [
        {offset:0,transform:transform(edgeX,edgeY,tilt * 1.8,.7),opacity:0},
        {offset:.1,opacity:1},
        {offset:.4,transform:transform(x,y,tilt * .25,1),opacity:1},
        {offset:.53,transform:transform(x * 1.04,y * 1.04,0,1),opacity:1},
        {offset:.67,transform:transform(x * .42,y * .42,0,.72),opacity:1},
        {offset:.74,transform:transform(x * .42,y * .42,0,.72),opacity:1},
        {offset:.94,transform:transform(targetX,targetY,tilt * .5,.58),opacity:0},
        {offset:1,opacity:0}
      ], {duration:4250,delay:index * 38,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
      return piece;
    });
    animate(logo, [
      {offset:0,opacity:0,clipPath:'inset(0 100% 0 0)',transform:'translate(-50%,-50%) scale(.9)'},
      {offset:.22,opacity:0,clipPath:'inset(0 100% 0 0)'},
      {offset:.54,opacity:1,clipPath:'inset(0 0% 0 0)',transform:'translate(-50%,-50%) scale(1)'},
      {offset:.78,opacity:1,clipPath:'inset(0 0% 0 0)',transform:'translate(-50%,-50%) scale(1)'},
      {offset:1,opacity:1,clipPath:'inset(0 0% 0 0)',transform:'translate(-50%,-50%) scale(.72)'}
    ], {duration:2800,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
    later(() => {
      const rect = navLogo.getBoundingClientRect();
      if (!rect.width || !rect.height) return finish();
      const dx = rect.left + rect.width / 2 - innerWidth / 2;
      const dy = rect.top + rect.height / 2 - innerHeight / 2;
      const scale = rect.width / logo.offsetWidth;
      animate(logo, [
        {transform:'translate(-50%,-50%) scale(.72)',opacity:1},
        {transform:`translate(-50%,-50%) translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0) scale(${scale.toFixed(4)})`,opacity:1}
      ], {duration:1020,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
    }, 2780);
    later(() => {splash.classList.add('is-leaving');html.classList.add('quest-show-corners')}, 3150);
    later(() => html.classList.add('quest-show-headline'), 3400);
    later(() => html.classList.add('quest-show-gallery'), 3600);
    later(() => html.classList.add('quest-show-nav'), 3700);
    later(() => {
      html.classList.add('quest-show-logo');
      animate(logo,[{opacity:1},{opacity:0}],{duration:220,fill:'forwards'});
    }, 3780);
    later(() => html.classList.add('quest-show-booking'), 3950);
    later(finish, 4650);
    const onResize = () => {if (!finished && performance.now() > 0) finish()};
    window.addEventListener('resize', onResize, {once:true});
    return true;
  };
  const ready = () => {
    if (finished) return;
    if (boot()) return;
    observing = new MutationObserver(() => {if (boot()) observing.disconnect()});
    observing.observe(app, {childList:true,subtree:true});
    later(() => {if (!started) finish()}, 2200);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, {once:true});
  else ready();
})();