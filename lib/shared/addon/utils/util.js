// Note: nothing Ember specific should go in here...
//
import { formatSi } from './parse-unit';
import { isEmpty } from '@ember/utils';
import { isArray } from '@ember/array';
import ipaddr from 'ipaddr.js';

export function arrayDiff(a, b) {
  return a.filter((i) => {
    return !b.includes(i);
  });
}

export function arrayIntersect(a, b) {
  return a.filter((i) => {
    return b.includes(i);
  });
}

export function compareDisplayEndpoint(i1, i2) {
  if ( !i1 ) {
    return 1;
  }

  if ( !i2 ) {
    return -1;
  }

  const in1 = i1.displayEndpoint;
  const in2 = i2.displayEndpoint;

  if ( !in1 ) {
    return 1;
  }

  if ( !in2 ) {
    return -1;
  }

  if ( in1.startsWith('/') && !in2.startsWith('/') ) {
    return -1;
  } else if ( !in1.startsWith('/') && in2.startsWith('/') ) {
    return 1;
  }

  if ( in1 === '80/http' && in2 !== '80/http' ) {
    return -1;
  } else if ( in1 !== '80/http' && in2 === '80/http' ) {
    return 1;
  }

  if ( in1 === '443/https' && in2 !== '443/https' ) {
    return -1;
  } else if ( in1 !== '443/https' && in2 === '443/https' ) {
    return 1;
  }

  return in1.localeCompare(in2);
}

export function convertToMillis(strValue) {
  if (!strValue) {
    return '';
  }
  if (strValue.endsWith('m')) {
    return parseInt(strValue.substr(0, strValue.length - 1), 10);
  } else {
    return parseInt(strValue, 10) * 1000;
  }
}

export function filterByValues(ary, field, values) {
  return ary.filter((obj) => {
    return values.includes(obj.get(field));
  });
}

export function download(url, id = '__downloadIframe') {
  var iframe = document.getElementById(id);

  if ( !iframe ) {
    iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.id = id;
    document.body.appendChild(iframe);
  }

  iframe.src = url;
}

export function popupWindowOptions(width, height) {
  var s = window.screen;
  var opt = {
    width:      Math.min(s.width, width || 1040),
    height:     Math.min(s.height, height || 768),
    resizable:  1,
    scrollbars: 1,
  };

  opt.left = Math.max(0, (s.width - opt.width) / 2);
  opt.top = Math.max(0, (s.height - opt.height) / 2);

  var optStr = Object.keys(opt).map((k) => {
    return `${ k }=${ opt[k] }`;
  }).join(',');

  return optStr;
}

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
};

export function escapeHtml(html) {
  return String(html).replace(/[&<>"'\/]/g, (s) => {
    return entityMap[s];
  });
}

export function escapeRegex(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function addQueryParam(url, key, val) {
  let out = url + (url.indexOf('?') >= 0 ? '&' : '?');

  // val can be a string or an array of strings
  if ( !Array.isArray(val) ) {
    val = [val];
  }
  out += val.map((v) => {
    return `${ encodeURIComponent(key)  }=${  encodeURIComponent(v) }`;
  }).join('&');

  return out;
}

export function addQueryParams(url, params) {
  if ( params && typeof params === 'object' ) {
    Object.keys(params).forEach((key) => {
      url = addQueryParam(url, key, params[key]);
    });
  }

  return url;
}

export function parseUrl(url) {
  var a = document.createElement('a');

  a.href = url;

  return a.cloneNode(false);
}

export function absoluteUrl(url) {
  return parseUrl(url).href;
}

export function validateEndpoint(str) {
  // credit to https://stackoverflow.com/questions/4460586/javascript-regular-expression-to-check-for-ip-addresses
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(str);
}

export function addAuthorization(url, user, pass) {
  url = absoluteUrl(url);
  var pos = url.indexOf('//');

  if ( pos >= 0 ) {
    url = `${ url.substr(0, pos + 2) +
          (user ? encodeURIComponent(user) : '') +
          (pass ? `:${  encodeURIComponent(pass) }` : '')
    }@${  url.substr(pos + 2) }`;
  } else {
    throw new Error(`That doesn't look like a URL: ${  url }`);
  }

  return url;
}

export function ucFirst(str) {
  str = str || '';

  return str.substr(0, 1).toUpperCase() + str.substr(1);
}

export function lcFirst(str) {
  str = str || '';

  return str.substr(0, 1).toLowerCase() + str.substr(1);
}

export function strPad(str, toLength, padChars, right) {
  str = `${ str }`;
  padChars = padChars || ' ';

  if ( str.length >= toLength ) {
    return str;
  }

  var neededLen = toLength - str.length + 1;
  var padStr = (new Array(neededLen)).join(padChars);

  padStr = padStr.substr(0, neededLen);

  if ( right ) {
    return str + padStr;
  } else {
    return padStr + str;
  }
}

// Turn thing1 into thing00000001 so that the numbers sort numerically
export function sortableNumericSuffix(str) {
  str = str || '';
  let match = str.match(/^(.*[^0-9])([0-9]+)$/)

  if ( match ) {
    return match[1] + Util.strPad(match[2], 8, '0');
  }

  return str;
}

export function timerFuzz(ms, maxFuzz = 0.1) {
  var factor = Math.random() * 2 * maxFuzz + (1 - maxFuzz);

  return Math.max(1, ms * factor);
}

export function random32(count) {
  count = Math.max(0, count || 1);
  var out = [];
  var i;

  if ( window.crypto && window.crypto.getRandomValues ) {
    var tmp = new Uint32Array(count);

    window.crypto.getRandomValues(tmp);
    for ( i = 0 ; i < tmp.length ; i++ ) {
      out[i] = tmp[i];
    }
  } else {
    for ( i = 0 ; i < count ; i++ ) {
      out[i] = Math.random() * 4294967296; // Math.pow(2,32);
    }
  }

  if ( count === 1 ) {
    return out[0];
  } else {
    return out;
  }
}

const alpha = 'abcdefghijklmnopqrstuvwxyz';
const num = '0123456789';
const sym = '!@#$%^&*()_+-=[]{};:,./<>?|';
const randomCharsets = {
  numeric:    num,
  novowels:   'bcdfghjklmnpqrstvwxz2456789',
  loweralpha: alpha,
  upperalpha: alpha.toUpperCase(),
  hex:        `${ num  }ABCDEF`,
  alpha:      alpha + alpha.toUpperCase(),
  alphanum:   alpha + alpha.toUpperCase() + num,
  password:   alpha + alpha.toUpperCase() + num + alpha + alpha.toUpperCase() + num + sym,
  // ^-- includes alpha / ALPHA / num twice to reduce the occurrence of symbols
};

export function randomStr(length = 16, charset = 'alphanum') {
  var chars = randomCharsets[charset];

  if ( !chars ) {
    return null;
  }

  var charCount = chars.length;

  return random32(length).map((val) => {
    return chars[ val % charCount ];
  }).join('');
}

export function formatPercent(value, maxPrecision = 2) {
  if ( value < 1 && maxPrecision >= 2 ) {
    return `${ Math.round(value * 100) / 100  }%`;
  } else if ( value < 10  && maxPrecision >= 1 ) {
    return `${ Math.round(value * 10) / 10  }%`;
  } else {
    return `${ Math.round(value)  }%`;
  }
}

export function formatMib(value) {
  return formatSi(value, 1024, 'iB', 'B', 2);
}

export function formatSecond(value) {
  if ( value < 0.1 ) {
    return `${ roundValue(value * 1000)  } ms`
  } else {
    return `${ roundValue(value)  } s`
  }
}

export function formatKbps(value) {
  return formatSi(value, 1000, 'bps', 'Bps', 1);
}

export function roundValue(value) {
  if ( value < 1 ) {
    return Math.round(value * 100) / 100;
  } else if ( value < 10 ) {
    return Math.round(value * 10) / 10;
  } else {
    return Math.round(value);
  }
}

export function formatGB(inMB) {
  return formatSi(inMB, 1000, 'B', 'B', 2);
}

export function constructUrl(ssl, host, port) {
  var out = `http${  ssl ? 's' : ''  }://${  host }`;

  if ( (ssl && port !== 443) || (!ssl && port !== 80) ) {
    out += `:${  port }`;
  }

  return out;
}

export function pluralize(count, singular, plural) {
  if ( !plural ) {
    if ( singular.substr(-1, 1) === 's' ) {
      plural = `${ singular  }es`;
    } else {
      plural = `${ singular  }s`;
    }
  }

  if ( count === 1 ) {
    return `${ count } ${ singular }`;
  } else {
    return `${ count } ${ plural }`;
  }
}

export function uniqKeys(data, field = undefined) {
  // Make a map of all the unique category names.
  // If multiple casings of the same name are present, first wins.
  let cased = {};

  data.map((obj) => (field ? obj[field] : obj))
    .filter((str) => str && str.length)
    .forEach((str) => {
      let lc = str.toLowerCase();

      if ( !cased[lc] ) {
        cased[lc] = str;
      }
    });

  return Object.keys(cased).uniq().sort().map((str) => cased[str]);
}

export function camelToTitle(str) {
  return (str || '').dasherize().split('-').map((str) => {
    return ucFirst(str);
  }).join(' ');
}

export function isNumeric(str) {
  return (`${ str }`).match(/^([0-9]+\.)?[0-9]*$/);
}

export function hostname(str) {
  return (str || '').trim().replace(/^[a-z0-9]+:\/+/i, '').replace(/\/.*$/g, '');
}
export function isPrivate(name) {
  return ipaddr.parse(name).range() === 'private' ? true : false;
}

export function stripScheme(url) {
  let val = (url || '').trim();

  return val.replace(/^https?:\/\//, '');
}

export function isBadTld(name) {
  if ( hostname(name).match(/\.local$/) ) {
    return true;
  } else {
    return false;
  }
}

function keyNotType(k) {
  return Object.keys(k).filter((key) => key !== 'type').length > 0;
}

export function removeEmpty(obj, excludedKeys = []){
  return Object.keys(obj)
    .filter((k) => !isEmpty(obj[k]) && (typeof obj[k] !== 'object' || keyNotType(obj[k])))
    .reduce((newObj, k) => !isArray(obj[k]) && typeof obj[k] === 'object' && excludedKeys.indexOf(k) === -1 ?
      Object.assign(newObj, { [k]: removeEmpty(obj[k], excludedKeys) }) :
      Object.assign(newObj, { [k]: obj[k] }),
    {});
}

export function underlineToCamel(str) {
  return (str || '').split('_').map((t, i) => {
    if ( i === 0 ) {
      return t;
    } else {
      return t === 'qps' ? 'QPS' : t.capitalize();
    }
  }).join('');
}

export function keysToCamel(obj) {
  if ( !typeof (obj) === 'object' || typeof (obj) === 'string' || typeof (obj) === 'number' || typeof (obj) === 'boolean' ) {
    return obj;
  }
  const keys = Object.keys(obj);
  let n = keys.length;

  while (n--) {
    const key = keys[n];
    const titleKey = underlineToCamel(key);

    obj[titleKey] = keysToCamel(obj[key]);
    if ( key !== titleKey ) {
      delete obj[key];
    }
  }

  return obj;
}

var Util = {
  absoluteUrl,
  addAuthorization,
  addQueryParam,
  addQueryParams,
  arrayDiff,
  arrayIntersect,
  compareDisplayEndpoint,
  camelToTitle,
  convertToMillis,
  constructUrl,
  download,
  escapeHtml,
  escapeRegex,
  filterByValues,
  formatGB,
  formatKbps,
  formatMib,
  formatSecond,
  formatPercent,
  hostname,
  isBadTld,
  isNumeric,
  isPrivate,
  keysToCamel,
  lcFirst,
  parseUrl,
  pluralize,
  popupWindowOptions,
  random32,
  randomStr,
  removeEmpty,
  roundValue,
  sortableNumericSuffix,
  strPad,
  stripScheme,
  timerFuzz,
  ucFirst,
  uniqKeys,
  underlineToCamel,
  validateEndpoint,
};

window.Util = Util;
export default Util;
