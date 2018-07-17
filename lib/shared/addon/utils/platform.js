export var platform = (navigator.platform || '').toLowerCase();
export var isLinuxy = platform.indexOf('linux') >= 0 || platform.indexOf('unix') >= 0;
export var isMac = platform.indexOf('mac') >= 0;
export var isWin = platform.indexOf('win') >= 0;

export var alternateKey = 'ctrlKey';
export var alternateLabel = 'Control';

export var moreKey = 'ctrlKey';
export var moreLabel = 'Control';

export var rangeKey = 'shiftKey';
export var rangeLabel = 'Shift';

if ( isMac ) {
  alternateKey = 'metaKey';
  alternateLabel = 'Command';
  moreKey = 'metaKey';
  moreLabel = 'Command';
}

export function isAlternate(event) {
  return !!event[alternateKey];
}

export function isMore(event) {
  return !!event[moreKey];
}

export function isRange(event) {
  return !!event[rangeKey];
}

// Only intended to work for Mobile Safari at the moment...
export function version() {
  let match = userAgent.match(/\s+Version\/([0-9.]+)/);

  if ( match ) {
    return parseFloat(match[1]);
  }

  return null;
}

export var userAgent = navigator.userAgent;
export var isGecko = userAgent.indexOf('Gecko/') >= 0;
export var isBlink = userAgent.indexOf('Chrome/') >= 0;
export var isWebKit = !isBlink && userAgent.indexOf('AppleWebKit/') >= 0;
export var isSafari = !isBlink && userAgent.indexOf('Safari/') >= 0;
export var isMobile = /Android|webOS|iPhone|iPad|iPod|IEMobile/i.test(userAgent);

export var xhrConcur = 99;
if ( isSafari ) {
  if ( version() && version() < 10 ) {
    // Safari for iOS9 has problems with multiple simultaneous requests
    xhrConcur = 1;
  }
}

