// util.js

const WARNING = 'SITE OFTEN FALSE OR MISLEADING';
const CLASS_MARK = 'fake-news-checked';

const $$ = (selector) => Array.from(document.querySelectorAll(selector));

// return the closest ancestor matching the selector, or undefined, if not found
matchingAncestor = (selector, node) => {
  while ((node = node.parentNode) && node.matches) {
    if (node.matches(selector)) {
      return node;
    }
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

const checkLink = (link, getTargetURL) => {
  if (!checkLink.regexp) {
    const manifest = chrome.runtime.getManifest();
    checkLink.regexp = makeRegexp(manifest.content_scripts[0].matches);
    console.info(checkLink.regexp);
  }

  const url = getTargetURL(link);
  const [matched] = url && checkLink.regexp.exec(url) || [];
  return matched && { link, url, matched };
};

const quoteRegexp = (s) =>
  s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

const makeHostRegexpString = (hostGlob) =>
  hostGlob.split('*.').map(quoteRegexp).join('(?:[^./]*\\.)*') + '/';

const makePathRegexpString = (hostGlob, pathGlob) =>
  [ makeHostRegexpString(hostGlob)
  , pathGlob.split('*').map(quoteRegexp).join('.*').replace(/\.\*$/, '')
  ].join('');

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
