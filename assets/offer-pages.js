/* Preview-only offer pages. Counts and promotions below are dummy data, not live Quest offers. */
(() => {
  const asset = '/quest-v2/assets/';
  const pages = [
    [
      {id:'stay-dine',count:12,title:'Stay & Dine at Quest with More Time for Every Family Moment Together and Little Extras',description:'A little more time around the table, together.',image:asset+'hero-breakfast.webp'},
      {id:'family-time',count:3,title:'More Family Time and Little Moments Worth Staying Longer For on Every Getaway',description:'Make room for the moments that make a trip yours.',image:asset+'hero-quality.webp'},
      {id:'unwind',count:5,title:'Room to Unwind',description:'Settle in, slow down, and enjoy the stay.',image:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=85'}
    ],
    [
      {id:'breakfast-days',count:4,title:'Breakfast Together Before a Day of New Memories and Shared Adventures',description:'Start the day with something delicious.',image:asset+'hero-breakfast.webp'},
      {id:'explore-more',count:6,title:'Stay Longer and Explore More Around Every Corner of Your Favorite City',description:'Make a little extra space for discovery.',image:asset+'hero-memories.webp'},
      {id:'pool-days',count:2,title:'Pool Days',description:'Slow afternoons and plenty of smiles.',image:asset+'hero-pool.webp'}
    ],
    [
      {id:'city-weekend',count:7,title:'A City Weekend Full of Food, Family Stories, and Places to Discover',description:'Follow your curiosity, together.',image:asset+'hero-memories.webp'},
      {id:'recharge',count:3,title:'More Time to Recharge Before the Next Adventure Begins at Quest',description:'Rest well and take your time.',image:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=85'},
      {id:'slow-mornings',count:5,title:'Slow Mornings',description:'Enjoy an unhurried start.',image:asset+'hero-breakfast.webp'}
    ],
    [
      {id:'rest-easy',count:8,title:'Rest Easy with Room for Everyone to Feel at Home on the Journey',description:'A comfortable place to come back to.',image:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=85'},
      {id:'getaway-sharing',count:4,title:'Make New Memories with a Getaway Made for Sharing and Staying Together',description:'More moments for the whole family.',image:asset+'hero-quality.webp'},
      {id:'local-discoveries',count:2,title:'Local Discoveries',description:'Find something new nearby.',image:asset+'hero-memories.webp'}
    ],
    [
      {id:'little-extras',count:9,title:'Little Extras for a Stay That Feels Like Yours from Morning to Night',description:'Find more reasons to enjoy your stay.',image:asset+'hero-pool.webp'},
      {id:'together-again',count:3,title:'Together Again for Breakfast, Good Stories, and Everything Beyond',description:'The best memories are made together.',image:asset+'hero-breakfast.webp'},
      {id:'easy-escapes',count:5,title:'Easy Escapes',description:'Make space for a fresh start.',image:asset+'hero-quality.webp'}
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