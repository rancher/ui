// Note: nothing Ember specific should go in here...

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
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + encodeURIComponent(key) + '=' + encodeURIComponent(val);
}

export function addQueryParams(url, params) {
  Object.keys(params).forEach(function(key) {
    url = addQueryParam(url, key, params[key]);
  });

  return url;
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

export function lcFirst(str) {
  str = str||'';
  return str.substr(0,1).toLowerCase() + str.substr(1);
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

export function random32(count)
{
  count = Math.max(0, count||1);
  var out = [];
  var i;
  if ( window.crypto && window.crypto.getRandomValues )
  {
    var tmp = new Uint32Array(count);
    window.crypto.getRandomValues(tmp);
    for ( i = 0 ; i < tmp.length ; i++ )
    {
      out[i] = tmp[i];
    }
  }
  else
  {
    for ( i = 0 ; i < count ; i++ )
    {
      out[i] = Math.random() * 4294967296; // Math.pow(2,32);
    }
  }

  if ( count === 1 )
  {
    return out[0];
  }
  else
  {
    return out;
  }
}

const alpha = 'abcdefghijklmnopqrstuvwxyz';
const num = '0123456789';
const sym = '!@#$%^&*()_+-=[]{};:,./<>?|';
const randomCharsets = {
  numeric: num,
  loweralpha: alpha,
  upperalpha: alpha.toUpperCase(),
  hex: num + 'ABCDEF',
  alpha: alpha + alpha.toUpperCase(),
  alphanum: alpha + alpha.toUpperCase() + num,
  password: alpha + alpha.toUpperCase() + num + sym,
};

export function randomStr(length=16, charset='alphanum')
{
  var chars = randomCharsets[charset];
  if ( !chars )
  {
    return null;
  }

  var charCount = chars.length;
  return random32(length).map((val) => {
    return chars[ val % charCount ];
  }).join('');
}

export function formatPercent(value, adaptive=true) {
  if ( value < 1 || adaptive === false )
  {
    return Math.round(value*100)/100 + '%';
  }
  else if ( value < 10 )
  {
    return Math.round(value*10)/10 + '%';
  }
  else
  {
    return Math.round(value) + '%';
  }
}

export function formatMib(value, adaptive=true) {
  if ( value >= 10240 && adaptive === true)
  {
    return Math.round(value/1024) + ' GiB';
  }
  else if ( value >= 1024 )
  {
    return Math.ceil(value/10.24)/100 + ' GiB';
  }
  else if ( value < 10 || adaptive === false )
  {
    return Math.round(value*10)/10 + ' MiB';
  }
  else
  {
    return Math.round(value) + ' MiB';
  }
}

export function formatKbps(value, adaptive=true) {
  if ( value >= 10000 && adaptive === true )
  {
    return Math.round(value/1000) + ' Mbps';
  }
  else if ( value >= 1000 )
  {
    return Math.ceil(value/100)/10 + ' Mbps';
  }
  else if ( value < 10 || adaptive === false )
  {
    return Math.round(value*10)/10 + ' Kbps';
  }
  else
  {
    return Math.round(value) + ' Kbps';
  }
}

export function constructUrl(ssl,host,port) {
  var out = 'http' + (ssl ? 's' : '') + '://' + host;
  if ( (ssl && port !== 443) || (!ssl && port !== 80) )
  {
    out += ':' + port;
  }

  return out;
}

export function pluralize(count,singular,plural) {
  if ( !plural )
  {
    if ( singular.substr(-1,1) === 's' )
    {
      plural = singular + 'es';
    }
    else
    {
      plural = singular + 's';
    }
  }

  if ( count === 1 )
  {
    return `${count} ${singular}`;
  }
  else
  {
    return `${count} ${plural}`;
  }
}

var Util = {
  arrayDiff: arrayDiff,
  arrayIntersect: arrayIntersect,
  constructUrl: constructUrl,
  download: download,
  popupWindowOptions: popupWindowOptions,
  escapeHtml: escapeHtml,
  addQueryParam: addQueryParam,
  addQueryParams: addQueryParams,
  absoluteUrl: absoluteUrl,
  addAuthorization: addAuthorization,
  ucFirst: ucFirst,
  lcFirst: lcFirst,
  strPad: strPad,
  timerFuzz: timerFuzz,
  random32: random32,
  randomStr: randomStr,
  formatPercent: formatPercent,
  formatMib: formatMib,
  formatKbps: formatKbps,
  pluralize: pluralize,
};

window.Util = Util;
export default Util;
