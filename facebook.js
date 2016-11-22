// facebook.js

const normalize = (domain) => domain.toLowerCase().replace(/^www\./, '');

const isMatch = (domain) => {
  if (!isMatch.domains) {
    const manifest = chrome.runtime.getManifest();
    isMatch.domains = manifest.content_scripts[0].matches.map(s =>
      normalize(s.replace(/^\*:\/\/(?:\*\.)?([^/]*).*/, '$1'))
    );
  }
  return isMatch.domains.indexOf(domain) !== -1;
};

const flag = (div) => {
  div.classList.add('fake-news-checked'); // only check each link once

  let domain = div.firstChild.nodeValue;
  if (!domain) { // also handle <span class="highlightNode">domain</span>:
    domain = div.firstElementChild.firstChild.nodeValue;
  }
  if (!isMatch(normalize(domain))) {
    // console.info(`skipped ${domain}`);
    return;
  }
  // console.info(`flagged ${domain}`);

  const root = div.parentNode.parentNode.parentNode.parentNode;

  const stripes = document.createElement('div');
  stripes.style.cssText = `
    position: absolute;
    height: 28px;
    bottom: 0px;
    right: 0;
    left: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      -45deg, #000, #000 20px, #df0 20px, #df0 40px
    );
  `;

  const warn = document.createElement('div');
  warn.textContent = 'SITE OFTEN FALSE OR MISLEADING';
  warn.style.cssText = `
    right: 8px;
    bottom: 8px;
    text-align: right;
    position: absolute;
    font-size: 11px;
    color: red;
    text-shadow:
      -1px -1px 0 #000,
      -1px  0   0 #000,
      -1px  1px 0 #000,
       0   -1px 0 #000,
       0    1px 0 #000,
       1px -1px 0 #000,
       1px  0   0 #000,
       1px  1px 0 #000;
  `;
  stripes.appendChild(warn);

  root.insertBefore(stripes, root.firstChild);
};

flagNew = () => {
  document.querySelectorAll('._6lz._6mb:not(.fake-news-checked)').forEach(flag);
};

// initial page sweep
flagNew();

// capture infinite-scroll-added content, too
setInterval(flagNew, 1e3);
