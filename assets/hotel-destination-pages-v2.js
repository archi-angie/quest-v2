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
    pager.innerHTML = Array.from({length: pageCount}, (_, i) =>
      '<button type="button" class="destination-page-dot" data-page="' + i +
      '" aria-label="Show destinations page ' + (i + 1) + ' of ' + pageCount +
      '" aria-pressed="' + (i === 0) + '"></button>'
    ).join('');
    list.insertAdjacentElement('afterend', pager);
    let page = 0;

    const update = () => {
      page = Math.max(0, Math.min(page, pageCount - 1));
      rows.forEach((row, index) => {
        row.hidden = mobile.matches && Math.floor(index / pageSize) !== page;
      });
      pager.hidden = !mobile.matches;
      pager.querySelectorAll('[data-page]').forEach((dot, index) => {
        dot.setAttribute('aria-pressed', String(index === page));
      });
    };
    const selectPage = nextPage => {
      page = Math.max(0, Math.min(nextPage, pageCount - 1));
      update();
      if (mobile.matches) rows[page * pageSize]?.click();
    };
    pager.addEventListener('click', event => {
      const dot = event.target.closest('[data-page]');
      if (dot) selectPage(Number(dot.dataset.page));
    });
    pager.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      selectPage((page + (event.key === 'ArrowRight' ? 1 : -1) + pageCount) % pageCount);
      pager.querySelector('[data-page="' + page + '"]')?.focus();
    });
    list.addEventListener('click', event => {
      const row = event.target.closest('.destination-row');
      const index = rows.indexOf(row);
      if (index < 0) return;
      page = Math.floor(index / pageSize);
      update();
    });
    mobile.addEventListener?.('change', () => {
      const selected = rows.findIndex(row => row.classList.contains('selected'));
      if (selected >= 0) page = Math.floor(selected / pageSize);
      update();
    });
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
