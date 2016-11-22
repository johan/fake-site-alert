// facebook.js

const warning = 'SITE OFTEN FALSE OR MISLEADING';
const classMark = 'fake-news-checked';

const $$ = (selector) => document.querySelectorAll(selector);

// Some (typically sponsored?) content goes through a redirector link shim:
const linkShimRe = /^https?:\/\/(?:[^.\/]+\.)*facebook\.com\/l\.php\?u=([^&]+)/;
const getTargetURL = (url) => {
  const [x, escaped] = linkShimRe.exec(url) || [];
  return escaped ? decodeURIComponent(escaped) : url;
};

// return the closest ancestor matching the selector, or undefined, if not found
matchingAncestor = (selector, node) => {
  while ((node = node.parentNode) && node.matches) {
    if (node.matches(selector)) {
      return node;
    }
  }
};

const flagLink = (a, matched, url) => {
  const parent = matchingAncestor('div._ohe', a);
  if (matched) {
    a.title = warning;
    if (parent && !parent.matches(`.${classMark}`)) {
      parent.appendChild(banner(warning));
      // console.info(`flagged ${matched}`);
    }
  } else {
    // console.info(`skipped ${url}`);
  }
  if (parent) {
    // on subsequent DOM scans, skip past this story, without even checking
    parent.classList.add(classMark);
  }
};

const banner = (message) => {
  const stripes = document.createElement('div');
  stripes.style.cssText = `
    height: 28px;
    text-align: center;
    background: repeating-linear-gradient(
      -45deg, #000, #000 20px, #df0 20px, #df0 40px
    );
  `;

  const warn = document.createElement('div');
  warn.textContent = message;
  warn.style.cssText = `
    margin: auto;
    padding: 0 4px;
    font-size: 14px;
    line-height: 28px;
    font-family: 'Lucida Console', Monaco, monospace;
    display: inline-block;
    background: #000;
    color: #fff;
  `;
  stripes.appendChild(warn);

  return stripes;
};

const checkLink = (a) => {
  if (!checkLink.regexp) {
    const manifest = chrome.runtime.getManifest();
    checkLink.regexp = makeRegexp(manifest.content_scripts[0].matches);
  }

  // multiple links may exist within one single story
  const url = getTargetURL(a.href);
  const [matched] = url && checkLink.regexp.exec(url) || [];
  flagLink(a, matched, url);
};

const flagNew = () => {
  $$('div._ohe:not(.fake-news-checked) a[href]:not(.img)').forEach(checkLink);
};

const quoteRegexp = (s) =>
  s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

const makeHostRegexpString = (hostGlob) =>
  hostGlob.split('*.').map(quoteRegexp).join('(?:[^./]*\\.)*') + '/';

const makePathRegexpString = (hostGlob, pathGlob) =>
  [ makeHostRegexpString(hostGlob)
  , pathGlob.split('*').map(quoteRegexp).join('.*').replace(/\.\*$/, '')
  ].join('')

// make a RegExp, given the extension's matchPatterns
const makeRegexp = (matchPatterns) => {
  const urlParts = new RegExp(`^[*]://([^/]*)/(.*)`);
  const parts = [];
  for (const pattern of matchPatterns) {
    const [x, host, path] = urlParts.exec(pattern) || [];
    if (host) {
      switch (path) {
        case '*': parts.push(makeHostRegexpString(host)); break;
        case '':  parts.push(makeHostRegexpString(host) + '$'); break;
        default:  parts.push(makePathRegexpString(host, path)); break;
      }
    }
  }
  return new RegExp(`^[^:]*://(?:${parts.join('|')})`, 'i');
};

// initial page sweep
flagNew();

// capture infinite-scroll-added content, too
setInterval(flagNew, 1e3);
