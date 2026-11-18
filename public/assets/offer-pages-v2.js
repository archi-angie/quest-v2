/* Preview-only offer pages. Counts and promotions below are dummy data, not live Quest offers. */
(() => {
  const asset = '/quest-v2/assets/';
  const pages = [
    [
      {id:'stay-dine',count:12,title:'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt',description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',image:asset+'hero-breakfast.webp'},
      {id:'family-time',count:3,title:'Lorem ipsum dolor sit amet consectetur adipiscing elit ut labore et dolore magna',description:'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',image:asset+'hero-quality.webp'},
      {id:'unwind',count:5,title:'Lorem ipsum',description:'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',image:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=85'}
    ],
    [
      {id:'breakfast-days',count:4,title:'Lorem ipsum dolor sit amet consectetur adipiscing elit ut labore et dolore magna aliqua',description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',image:asset+'hero-breakfast.webp'},
      {id:'explore-more',count:6,title:'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor labore',description:'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',image:asset+'hero-memories.webp'},
      {id:'pool-days',count:2,title:'Lorem ipsum',description:'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',image:asset+'hero-pool.webp'}
    ],
    [
      {id:'city-weekend',count:7,title:'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor magna',description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',image:asset+'hero-memories.webp'},
      {id:'recharge',count:3,title:'Lorem ipsum dolor sit amet consectetur adipiscing elit ut enim ad minim veniam quis',description:'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',image:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=85'},
      {id:'slow-mornings',count:5,title:'Lorem ipsum',description:'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',image:asset+'hero-breakfast.webp'}
    ],
    [
      {id:'rest-easy',count:8,title:'Lorem ipsum dolor sit amet consectetur adipiscing elit ut enim ad minim veniam',description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',image:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=85'},
      {id:'getaway-sharing',count:4,title:'Lorem ipsum dolor sit amet consectetur adipiscing elit sed ut perspiciatis unde',description:'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',image:asset+'hero-quality.webp'},
      {id:'local-discoveries',count:2,title:'Lorem ipsum',description:'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',image:asset+'hero-memories.webp'}
    ],
    [
      {id:'little-extras',count:9,title:'Lorem ipsum dolor sit amet consectetur adipiscing elit quis nostrud exercitation',description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',image:asset+'hero-pool.webp'},
      {id:'together-again',count:3,title:'Lorem ipsum dolor sit amet consectetur adipiscing elit dolore magna aliqua ut enim',description:'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',image:asset+'hero-breakfast.webp'},
      {id:'easy-escapes',count:5,title:'Lorem ipsum',description:'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',image:asset+'hero-quality.webp'}
    ]
  ];
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const card = (offer, index) => `<article class="offer-ticket" aria-labelledby="offer-${escape(offer.id)}" style="--offer-index:${index}">
    <div class="offer-thumbnail-wrap"><img class="offer-thumbnail" src="${escape(offer.image)}" alt="Illustrative hotel stay moment" loading="lazy"></div>
    <span class="offer-perforation" aria-hidden="true"></span>
    <div class="offer-ticket-copy"><small class="offer-count">${offer.count} HOTELS</small><h3 class="offer-title" id="offer-${escape(offer.id)}">${escape(offer.title)}</h3><p>${escape(offer.description)}</p></div>
    <button class="offer-learn" type="button" aria-label="Learn more about ${escape(offer.title)}" data-offer="${escape(offer.id)}">Learn More</button>
    <span class="offer-note" role="status" aria-live="polite"></span>
  </article>`;
  const init = () => {
    const list = document.querySelector('#offer-list');
    if (!list || document.querySelector('.offer-pagination')) return;
    const nav = document.createElement('nav');
    nav.className = 'offer-pagination';
    nav.setAttribute('aria-label','Sample offer pages');
    list.after(nav);
    let page = 0;
    const render = () => {
      list.innerHTML = pages[page].map(card).join('');
      nav.innerHTML = pages.map((_,i) => `<button class="offer-page-bubble${i===page?' is-active':''}" type="button" data-offer-page="${i}" aria-label="Show sample offers page ${i+1}" ${i===page?'aria-current="page"':''}><span aria-hidden="true"></span></button>`).join('');
      list.setAttribute('aria-label',`Sample offers page ${page+1} of ${pages.length}`);
    };
    nav.addEventListener('click', event => {
      const button = event.target.closest('[data-offer-page]');
      if (!button) return;
      page = Number(button.dataset.offerPage);
      render();
      nav.querySelector('[data-offer-page="'+page+'"]')?.focus({preventScroll:true});
    });
    list.addEventListener('click', event => {
      const button = event.target.closest('.offer-learn');
      if (!button) return;
      const ticket = button.closest('.offer-ticket');
      ticket.querySelector('.offer-note').textContent = 'Preview offer — live details are not connected yet.';
      ticket.classList.add('is-sample-noted');
    });
    render();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();