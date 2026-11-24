(() => {
  const base = "/quest-v2/assets/";
  const brands = [
    ["Aston","aston"],["Huxley","huxley"],["The Park Lane","parklane"],["The Alana","alana"],
    ["Avanika","avanika"],["Kamuela","kamuela"],["Harper","harper"],["Aston Collection","collection"],
    ["Quest","quest"],["Four Corners","fourcorners"],["Neo","neo"],["Fave","fave"],["Nordic","nordic"]
  ];
  const awards = [
    ["Top Member 2025","top-member",""],
    ["Hospitality Management Company","iso-9001","Hospitality Management Company"],
    ["Occupational Health and Safety Management System","iso-45001","Occupational Health and Safety Management System"],
    ["Environmental Management System","iso-14001","Environmental Management System"]
  ];
  const icon = (name,label,url) => '<a href="' + url + '" aria-label="' + label + '" target="_blank" rel="noopener noreferrer"><iconify-icon icon="' + name + '" aria-hidden="true"></iconify-icon></a>';
  const brandsHtml = brands.map(([label,file]) => '<li><img src="' + base + 'footer-brands/' + file + '.svg" alt="' + label + '" loading="lazy"></li>').join('');
  const awardsHtml = awards.map(([label,file,caption]) => '<li><img src="' + base + 'footer-achievements/' + (file === 'top-member' ? 'top-member-2025.png' : file + '.png') + '" alt="' + label + '" loading="lazy">' + (caption ? '<span>' + caption + '</span>' : '') + '</li>').join('');
  function render() {
    const footer = document.querySelector('footer.footer');
    if (!footer || footer.dataset.questFooter === '3') return !!footer;
    footer.dataset.questFooter = '3';
    footer.innerHTML =
      '<section class="qf-cta" aria-labelledby="qf-cta-title"><img class="qf-pattern qf-pattern--cta-left" src="' + base + 'pattern-04.svg" alt="" aria-hidden="true"><img class="qf-pattern qf-pattern--cta-right" src="' + base + 'pattern-02.svg" alt="" aria-hidden="true"><div class="qf-inner qf-cta-content"><div><p class="qf-eyebrow">◇ &nbsp; GET IN TOUCH</p><h2 id="qf-cta-title">Let’s plan your stay</h2><p class="qf-cta-copy">Speak directly with our reservations team.<br>No call centers, no hold music.</p></div><a class="qf-book" href="#booking">Book now</a></div></section>' +
      '<div class="qf-main"><div class="qf-inner qf-main-grid"><div class="qf-logo-social"><img class="qf-logo" src="' + base + 'logo-questhotels-20261124.svg" alt="Quest Hotels"><div class="qf-social" aria-label="Social accounts">' +
      icon('mdi:facebook','Quest Hotels on Facebook','https://www.facebook.com/questhotels/') +
      icon('mdi:instagram','Quest Hotels on Instagram','https://www.instagram.com/quest_hotels/') +
      '<span aria-label="TikTok" role="img"><iconify-icon icon="ic:baseline-tiktok" aria-hidden="true"></iconify-icon></span>' +
      icon('simple-icons:x','Quest Hotels on X','https://x.com/QuestHotels') +
      icon('mdi:youtube','Archipelago Hotels on YouTube','https://www.youtube.com/user/ArchipelagoIntl') +
      '</div></div><nav aria-label="Footer navigation"><div><h3>STAY</h3><a href="#hotels">Hotels</a><a href="#meetings">Meetings</a><a href="#weddings">Weddings</a></div><div><h3>EXPLORE</h3><a href="#news">News</a><a href="https://www.questhotels.com/en/news">Articles</a><a href="#offers">Offers</a></div><div><h3>REACH US</h3><a href="mailto:marketing@archipelagohotels.com">Contact</a></div></nav></div></div>' +
      '<div class="qf-brands"><div class="qf-brands-viewport"><div class="qf-brands-track"><ul class="qf-brands-sequence" aria-label="Archipelago brands">' + brandsHtml + '</ul></div></div></div>' +
      '<div class="qf-corporate"><div class="qf-inner"><div class="qf-corporate-head"><span>ARCHIPELAGO</span><span aria-hidden="true">⌄</span></div><div class="qf-corporate-content"><nav aria-label="Archipelago corporate links"><span>E-commerce &amp; Global Distribution</span><span>Architecture &amp; Interior Design</span><span>Good Governance</span><span>Hotel Management</span><span>Technology</span><span>Careers</span><span>Franchise Plus</span><span>Our Story</span><span>Legal</span><span>Condotels</span></nav><ul class="qf-awards" aria-label="Achievements">' + awardsHtml + '</ul></div></div></div>' +
      '<div class="qf-bottom"><div class="qf-inner"><span>Copyright ' + new Date().getFullYear() + ' © Archipelago</span><div><span>LLMs.txt</span><a href="#app">Back to top ↑</a></div></div></div>';
    const viewport = footer.querySelector('.qf-brands-viewport');
    const track = footer.querySelector('.qf-brands-track');
    const first = footer.querySelector('.qf-brands-sequence');
    const fillBrands = () => {
      [...track.children].slice(1).forEach(copy => copy.remove());
      const step = first.getBoundingClientRect().width;
      if (!step) return;
      track.style.setProperty('--qf-brand-step', step + 'px');
      const count = Math.max(3, Math.ceil(viewport.clientWidth / step) + 2);
      for (let i = 1; i < count; i++) {
        const copy = first.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.removeAttribute('aria-label');
        track.append(copy);
      }
    };
    fillBrands();
    if ('ResizeObserver' in window) new ResizeObserver(fillBrands).observe(viewport);
    else window.addEventListener('resize', fillBrands, {passive:true});
    return true;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, {once:true}); else render();
  if (!render()) {
    const observer = new MutationObserver(() => {if (render()) observer.disconnect();});
    observer.observe(document.documentElement, {childList:true,subtree:true});
  }
})();