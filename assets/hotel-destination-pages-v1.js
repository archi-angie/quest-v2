(() => {
  const mobile = matchMedia('(max-width: 700px)');
  const mount = () => {
    const list = document.querySelector('#destination-list');
    const rows = [...(list?.querySelectorAll('.destination-row') || [])];
    if (!list || rows.length < 3) return false;
    if (list.dataset.paged === 'true') return true;
    list.dataset.paged = 'true';

    const pageSize = 2;
    const pageCount = Math.ceil(rows.length / pageSize);
    const pager = document.createElement('div');
    pager.className = 'destination-pages';
    pager.setAttribute('role', 'group');
    pager.setAttribute('aria-label', 'Destination pages');
    pager.innerHTML = Array.from({length:pageCount}, (_, i) =>
      '<button type="button" class="destination-page-dot" data-page="' + i +
      '" aria-label="Show destinations page ' + (i + 1) + ' of ' + pageCount +
      '" aria-pressed="' + (i === 0) + '"></button>'
    ).join('');
    list.insertAdjacentElement('afterend', pager);
    let page = 0;

    const update = () => {
      rows.forEach((row, index) => {
        row.hidden = mobile.matches && Math.floor(index / pageSize) !== page;
      });
      pager.hidden = !mobile.matches;
      pager.querySelectorAll('[data-page]').forEach((dot, index) => {
        dot.setAttribute('aria-pressed', String(index === page));
      });
    };
    pager.addEventListener('click', event => {
      const dot = event.target.closest('[data-page]');
      if (!dot) return;
      page = Number(dot.dataset.page);
      update();
    });
    pager.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      page = (page + (event.key === 'ArrowRight' ? 1 : -1) + pageCount) % pageCount;
      update();
      pager.querySelector('[data-page="' + page + '"]')?.focus();
    });
    mobile.addEventListener?.('change', update);
    update();
    return true;
  };
  if (mount()) return;
  const observer = new MutationObserver(() => {
    if (mount()) observer.disconnect();
  });
  observer.observe(document.documentElement, {childList:true,subtree:true});
  setTimeout(() => observer.disconnect(), 8000);
})();