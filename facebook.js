// facebook.js

// Some (typically sponsored?) content goes through a redirector link shim:
const linkShimRe = /^https?:\/\/(?:[^.\/]+\.)*facebook\.com\/l\.php\?u=([^&]+)/;
const getTargetURL = (a) => {
  const [x, escaped] = linkShimRe.exec(a.href) || [];
  return escaped ? decodeURIComponent(escaped) : a.href;
};

const flagLink = (a, matched, url) => {
  const parent = matchingAncestor('div._ohe', a);
  if (matched) {
    a.title = WARNING;
    if (parent && !parent.matches(`.${CLASS_MARK}`)) {
      parent.appendChild(banner(WARNING));
      // console.info(`flagged ${matched}`);
    }
  } else {
    // console.info(`skipped ${url}`);
  }
  if (parent) {
    // on subsequent DOM scans, skip past this story, without even checking
    parent.classList.add(CLASS_MARK);
  }
};

const flagNew = () => {
  const links = $$(`div._ohe:not(.${CLASS_MARK}) a[href]:not(.img)`);
  const found = links.map(a => checkLink(a, getTargetURL)).filter(fake => fake);
  let link, url, matched;
  for ({link, url, matched} of found) {
    flagLink(link, matched, url);
  }
};

// initial page sweep
flagNew();

// capture infinite-scroll-added content, too
setInterval(flagNew, 1e3);
