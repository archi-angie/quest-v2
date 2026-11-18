/* Preview-only offer pages. Counts and promotions below are dummy data, not live Quest offers. */
(() => {
  const asset = '/quest-v2/assets/';
  const pages = [
    [
      {id:'stay-dine',count:12,title:'Stay & Dine with More Time to Share at Quest',description:'Enjoy a relaxed meal and more time around the table.',image:asset+'hero-breakfast.webp'},
      {id:'family-time',count:3,title:'Family Days Made for Little Adventures Together',description:'Make space for the moments that turn a trip into a memory.',image:asset+'hero-quality.webp'},
      {id:'unwind',count:5,title:'Room to Unwind',description:'Settle in, slow down, and enjoy a comfortable stay.',image:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=85'}
    ],
    [
      {id:'breakfast-days',count:4,title:'Breakfast Moments to Begin Your Day Together',description:'Start the morning with something delicious.',image:asset+'hero-breakfast.webp'},
      {id:'explore-more',count:6,title:'Stay a Little Longer and Explore the City',description:'Give yourself room for another day of discovery.',image:asset+'hero-memories.webp'},
      {id:'pool-days',count:2,title:'Pool Days',description:'Take a refreshing break between adventures.',image:asset+'hero-pool.webp'}
    ],
    [
      {id:'city-weekend',count:7,title:'A Weekend Full of Local Food and Stories',description:'Follow the flavors and stories of the city.',image:asset+'hero-memories.webp'},
      {id:'recharge',count:3,title:'Rest and Recharge Before the Next Adventure',description:'Rest well before setting off again.',image:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=85'},
      {id:'slow-mornings',count:5,title:'Slow Mornings',description:'Take your time over breakfast.',image:asset+'hero-breakfast.webp'}
    ],
    [
      {id:'rest-easy',count:8,title:'Comfortable Stays for Every Family Getaway',description:'Find a welcoming room for the whole family.',image:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=85'},
      {id:'getaway-sharing',count:4,title:'New Memories Around Every Corner of the City',description:'Share a new experience around every corner.',image:asset+'hero-quality.webp'},
      {id:'local-discoveries',count:2,title:'Local Discoveries',description:'See what is waiting nearby.',image:asset+'hero-memories.webp'}
    ],
    [
      {id:'little-extras',count:9,title:'Little Extras to Make More of Your Stay',description:'Add a little more joy to your getaway.',image:asset+'hero-pool.webp'},
      {id:'together-again',count:3,title:'Time Together from Breakfast to Sunset',description:'Make more time for meals and memories.',image:asset+'hero-breakfast.webp'},
      {id:'easy-escapes',count:5,title:'Easy Escapes',description:'Step away for a change of scene.',image:asset+'hero-quality.webp'}
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