export var platform = (navigator.platform||'').toLowerCase();
export var isLinuxy = platform.indexOf('linux') >= 0;
export var isMac = platform.indexOf('mac') >= 0;
//var isWin = platform.indexOf('win') >= 0;

export var alternateKey = 'altKey';
export var alternateLabel = 'Alt';
if ( isMac || isLinuxy)
{
  alternateKey = 'metaKey';
  if ( isMac )
  {
    alternateLabel = 'Command';
  }
  else
  {
    alternateLabel = 'Meta';
  }
}

export function isAlternate(event) {
  return !!event[alternateKey];
}

// ------------

export var moreKey = 'ctrlKey';
export var moreLabel = 'Control';
if ( isMac )
{
  moreKey = 'metaKey';
  moreLabel = 'Command';
}

export function isMore(event) {
  return !!event[moreKey];
}

// ------------
export var rangeKey = 'shiftKey';
export var rangeLabel = 'Shift';
export function isRange(event) {
  return !!event[rangeKey];
}
