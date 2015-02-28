export var platform = (navigator.platform||'').toLowerCase();
//export var isLinuxy = platform.indexOf('linux') >= 0;
export var isMac = platform.indexOf('mac') >= 0;
//var isWin = platform.indexOf('win') >= 0;

export var alternateKey = 'ctrlKey';
export var alternateLabel = 'Control';

export var moreKey = 'ctrlKey';
export var moreLabel = 'Control';

export var rangeKey = 'shiftKey';
export var rangeLabel = 'Shift';

if ( isMac )
{
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
