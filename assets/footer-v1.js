(() => {
  const base = "/quest-v2/assets/";
  const brands = [
    ["Archipelago Collection","collection"],["Aston","aston"],["The Alana","alana"],["Harper","harper"],
    ["Quest","quest"],["Neo","neo"],["Fave","fave"],["Kamuela","kamuela"],
    ["Avanika","avanika"],["Nordic","nordic"],["Huxley","huxley"],["The Park Lane","parklane"],["Four Corners","fourcorners"]
  ];
  const awards = [
    ["ISO 9001","iso-9001"],["ISO 14001","iso-14001"],["ISO 45001","iso-45001"],["Top Member 2025","top-member"]
  ];
  const brandMarkup = brands.map(([label, file]) => '<li><img src="' + base + 'footer-brands/' + file + '.svg" alt="' + label + '" loading="lazy"></li>').join("");
  const awardMarkup = awards.map(([label, file]) => '<li><img src="' + base + 'footer-achievements/' + file + '.png" alt="' + label + '" loading="lazy"></li>').join("");
  function render() {
    const footer = document.querySelector("footer.footer");
    if (!footer || footer.dataset.questFooter === "1") return !!footer;
    footer.dataset.questFooter = "1";
    footer.innerHTML = '<div class="quest-footer-top"><div class="quest-footer-inner quest-footer-intro">' +
      '<div class="quest-footer-identity"><img src="' + base + 'quest-white.svg" alt="Quest Hotels"><p>Make room for every moment.</p></div>' +
      '<div class="quest-footer-links"><nav aria-label="Explore Quest"><h2>Explore</h2><a href="#hotels">Hotels</a><a href="#offers">Offers</a><a href="#news">News</a><a href="#moments">Moments</a></nav>' +
      '<nav aria-label="More from Quest"><h2>More from Quest</h2><a href="#membership">Membership</a><a href="https://www.questhotels.com/en" target="_blank" rel="noopener">Quest Hotels</a><a href="mailto:marketing@archipelagohotels.com">Contact us</a></nav></div></div></div>' +
      '<div class="quest-footer-message"><div class="quest-footer-inner"><span class="quest-footer-kicker">THE QUEST FAMILY</span><p>Every stay has a story. Let’s make yours memorable.</p></div></div>' +
      '<div class="quest-footer-brands"><div class="quest-footer-inner"><h2>Our family of brands</h2><ul aria-label="Archipelago hotel brands">' + brandMarkup + '</ul></div></div>' +
      '<div class="quest-footer-awards"><div class="quest-footer-inner"><div><span class="quest-footer-kicker">OUR COMMITMENT</span><h2>Good stays, made with care.</h2></div><ul aria-label="Achievements and certifications">' + awardMarkup + '</ul></div></div>' +
      '<div class="quest-footer-bottom"><div class="quest-footer-inner"><span>© ' + new Date().getFullYear() + ' Quest Hotels. All rights reserved.</span><a href="mailto:marketing@archipelagohotels.com">Contact corporate marketing</a></div></div>';
    return true;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render, {once:true});
  else render();
  if (!render()) {
    const observer = new MutationObserver(() => { if (render()) observer.disconnect(); });
    observer.observe(document.documentElement, {childList:true,subtree:true});
  }
})();