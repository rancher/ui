
export function arrayDiff(a, b) {
  return a.filter(function(i) {
    return b.indexOf(i) < 0;
  });
}

export function arrayIntersect(a, b) {
  return a.filter(function(i) {
    return b.indexOf(i) >= 0;
  });
}

export function download(url, id='__downloadIframe') {
  var iframe = document.getElementById(id);
  if ( !iframe )
  {
    iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.id = id;
    document.body.appendChild(iframe);
  }

  iframe.src = url;
}

export function popupWindowOptions(width,height) {
  var s = window.screen;
  var opt = {
    width: Math.min(s.width, width||1040),
    height: Math.min(s.height, height||768),
    resizable: 1,
    scrollbars: 1,
  };

  opt.left = Math.max(0, (s.width-opt.width)/2);
  opt.top = Math.max(0, (s.height-opt.height)/2);

  var optStr = Object.keys(opt).map(function(k) {
    return k+'='+opt[k];
  }).join(',');

  return optStr;
}

var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};
export function escapeHtml(html) {
  return String(html).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}

export function addQueryParam(url, key, val) {
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + key + '=' + encodeURIComponent(val);
}

export function absoluteUrl(url) {
  var a = document.createElement('a');
  a.href = url;
  return a.cloneNode(false).href;
}

export function addAuthorization(url, user, pass) {
  url = absoluteUrl(url);
  var pos = url.indexOf('//');
  if ( pos >= 0 )
  {
    url = url.substr(0,pos+2) +
          (user ? encodeURIComponent(user) : '') +
          (pass ? ':' + encodeURIComponent(pass) : '') +
          '@' + url.substr(pos+2);
  }
  else
  {
    throw new Error("That doesn't look like a URL: " + url);
  }

  return url;
}

export function ucFirst(str) {
  str = str||'';
  return str.substr(0,1).toUpperCase() + str.substr(1);
}

export function strPad(str, toLength, padChars, right)
{
  str = str+'';
  padChars = padChars||' ';

  if ( str.length >= toLength )
  {
    return str;
  }

  var neededLen = toLength - str.length + 1;
  var padStr = (new Array(neededLen)).join(padChars);
  padStr = padStr.substr(0,neededLen);

  if ( right )
  {
    return str + padStr;
  }
  else
  {
    return padStr + str;
  }
}

export function timerFuzz(ms, maxFuzz=0.1)
{
  var factor = Math.random()*2*maxFuzz + (1-maxFuzz);
  return Math.max(1, ms * factor);
}


var Util = {
  arrayDiff: arrayDiff,
  arrayIntersect: arrayIntersect,
  download: download,
  popupWindowOptions: popupWindowOptions,
  escapeHtml: escapeHtml,
  addQueryParam: addQueryParam,
  absoluteUrl: absoluteUrl,
  addAuthorization: addAuthorization,
  ucFirst: ucFirst,
  strPad: strPad,
  timerFuzz: timerFuzz
};

window.Util = Util;
export default Util;
