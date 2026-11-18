/* Demo news stories. Replace with CMS records and verified URLs when available. */
(() => {
  const asset = '/quest-v2/assets/';
  const fallback = asset + 'hero-quality.webp';
  // Story concepts and publication dates are placeholders; hotel names mirror the verified hotel list.
  const items = [
    {id:'moments',image:asset+'hero-quality.webp',imageAlt:'Mother and daughter laughing together',hotelName:'Quest Hotel San Denpasar',createdAt:'2026-11-12',title:'Little moments, lasting memories',description:'Stories and smiles that make time together feel special.'},
    {id:'breakfast',image:asset+'hero-breakfast.webp',imageAlt:'Breakfast with pancakes and fruit',hotelName:'Quest Prime Cikarang',createdAt:'2026-11-08',title:'Breakfast stories worth sharing',description:'Good mornings start around the same table.'},
    {id:'explore',image:asset+'hero-memories.webp',imageAlt:'Family walking together in a tropical garden',hotelName:'Quest Hotel Kuta',createdAt:'2026-10-31',title:'Finding more time together around the city and back again at Quest',description:'A little time to wander can become a favorite memory.'},
    {id:'rest',image:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=85',imageAlt:'Warm and comfortable hotel room',hotelName:'Quest Hotel Simpang Lima - Semarang',createdAt:'2026-10-24',title:'Room to recharge',description:'Come back to comfort after a day out together.'},
    {id:'pool',image:asset+'hero-pool.webp',imageAlt:'Family laughing together in a hotel pool',hotelName:'Quest Hotel Balikpapan',createdAt:'2026-10-28',title:'Pool days at Quest',description:'Time to slow down and enjoy the water together.'}
  ];
  const formatDate = iso => new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(iso+'T00:00:00Z'));
  const setDate = (element,iso) => {
    element.hidden = !iso;
    if (iso) {element.dateTime = iso;const formatted = formatDate(iso);element.textContent = element.classList.contains('news-stage-date-sticker') ? formatted.toUpperCase() : 'Created ' + formatted;element.setAttribute('aria-label','Created ' + formatted);}
  };
  const init = () => {
    const stage = document.querySelector('.news-stage');
    if (!stage) return;
    const featured = stage.querySelector('.news-stage-featured');
    const left = stage.querySelector('.news-stage-preview-left');
    const right = stage.querySelector('.news-stage-preview-right');
    const note = stage.querySelector('.news-stage-detail-note');
    const announcement = document.createElement('p');
    announcement.className = 'sr-only';
    announcement.setAttribute('aria-live','polite');
    announcement.setAttribute('aria-atomic','true');
    stage.querySelector('.news-stage-inner').append(announcement);
    let active = 0;
    let changing = false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const setImage = (img, item) => {
      img.onerror = () => { img.onerror = null; img.src = fallback; };
      img.src = item.image || fallback;
      img.alt = item.imageAlt || 'Quest Hotels story image';
    };
    const preview = (button, item, direction) => {
      if (!item) {button.hidden = true;return;}
      button.hidden = false;
      setImage(button.querySelector('img'),item);
      button.querySelector('.news-stage-preview-hotel').textContent = item.hotelName || 'Quest Hotels';
      button.querySelector('strong').textContent = item.title;
      button.setAttribute('aria-label',`Show ${direction} news story: ${item.title}`);
    };
    const render = () => {
      const item = items[active];
      setImage(featured.querySelector('img'),item);
      featured.querySelector('.news-stage-badge').textContent = item.hotelName || 'Quest Hotels';
      setDate(featured.querySelector('.news-stage-date-sticker'),item.createdAt);
      featured.querySelector('h3').textContent = item.title;
      const description = featured.querySelector('p:not(.news-stage-detail-note)');
      description.textContent = item.description || '';
      description.hidden = !item.description;
      const action = stage.querySelector('.news-stage-action');
      action.innerHTML = item.href
        ? `<a class="pill hotel-explore news-stage-read" href="${item.href}" rel="noopener noreferrer">Read More <span aria-hidden="true">→</span></a>`
        : '<button class="pill hotel-explore news-stage-read" type="button">Read More <span aria-hidden="true">→</span></button>';
      note.textContent = '';
      const prevItem = items.length > 2 ? items[(active + items.length - 1) % items.length] : null;
      const nextItem = items.length > 1 ? items[(active + 1) % items.length] : null;
      preview(left,prevItem,'previous');
      preview(right,nextItem,'next');
      stage.querySelectorAll('.news-stage-control').forEach(button => {button.hidden = items.length < 2;});
    };
    const change = delta => {
      if (changing || items.length < 2) return;
      const next = (active + delta + items.length) % items.length;
      if (reduce.matches) {
        active = next;render();announcement.textContent = `Featured story: ${items[active].title}`;return;
      }
      changing = true;
      stage.dataset.newsStep = String(delta);
      stage.classList.add('is-changing');
      window.setTimeout(() => {
        active = next;
        render();
        announcement.textContent = `Featured story: ${items[active].title}`;
        stage.classList.remove('is-changing');
        stage.classList.add('is-settling');
        window.setTimeout(() => {stage.classList.remove('is-settling');changing = false;},370);
      },230);
    };
    stage.addEventListener('click', event => {
      const direction = event.target.closest('[data-news-direction]');
      if (direction) {change(Number(direction.dataset.newsDirection));return;}
      const read = event.target.closest('button.news-stage-read');
      if (read) note.textContent = 'These preview stories are not connected to news pages yet.';
    });
    items.forEach(item => {const image = new Image();image.src = item.image;});
    render();
    if (!reduce.matches && 'IntersectionObserver' in window) {
      stage.classList.add('motion-ready');
      const observer = new IntersectionObserver(entries => {
        stage.classList.toggle('is-visible',entries[0].isIntersecting);
      },{threshold:.12});
      observer.observe(stage);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();