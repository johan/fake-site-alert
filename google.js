// google.js

const getTargetURL = (a) => a.dataset.href || a.href;

const flagLink = (a, matched, url) => {
  const parent = matchingAncestor('div[class]', a);
  if (parent) {
    parent.title = WARNING;
    parent.appendChild(banner(WARNING));
  }

  // on subsequent DOM scans, skip past this story, without even checking
  a.classList.add(CLASS_MARK);
};

const flagNew = () => {
  const cites = $$(`h3 > a[href]:not(.${CLASS_MARK})`);
  const found = cites.map(a => checkLink(a, getTargetURL)).filter(fake => fake);
  let link, url, matched;
  for ({link, url, matched} of found) {
    flagLink(link, matched, url);
  }
};

// initial page sweep
flagNew();

// capture infinite-scroll-added content, too, if present
setInterval(flagNew, 1e3);
