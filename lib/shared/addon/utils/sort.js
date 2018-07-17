import { isArray } from '@ember/array';
import { get } from '@ember/object';
import { compare as compareVersion } from 'shared/utils/parse-version';

const LOCALE_SAFE = /^[\w-.\s,]*$/;

function lcStr(x) {
  if ( typeof x === 'string' ) {
    return x.toLowerCase();
  } else {
    return String(x).toLowerCase();
  }
}

export function insensitiveCompare(a, b) {
  if ( typeof a === 'string' || typeof b === 'string' ) {
    a = lcStr(a);
    b = lcStr(b);
  } else {
    return (a > b ? 1 : (a < b ? -1 : 0));
  }

  if ( LOCALE_SAFE.test(a + b) ) {
    return (a > b ? 1 : (a < b ? -1 : 0));
  } else {
    return a.localeCompare(b, { sensitivity: 'base' });
  }
}

export function sortInsensitiveBy(ary, ...fields) {
  // sortInsensitiveBy(ary, field1, field2) or sortInsensitiveBy(ary, [field1, field2])
  if ( fields.length === 1 && isArray(fields[0]) ) {
    fields = fields[0];
  }

  return ary.sort((a, b) => {
    let out = 0;

    for ( var i = 0 ; i < fields.length ; i++ ) {
      let aa = get(a, fields[i]);
      let bb = get(b, fields[i]);

      out = insensitiveCompare(aa, bb);
      if ( out !== 0 ) {
        break;
      }
    }

    return out;
  });
}

export function sortVersions(ary, key) {
  let aa, bb;

  return ary.sort((a, b) => {
    if ( key ) {
      aa = get(a, key);
      bb = get(b, key);
    } else {
      aa = a;
      bb = b;
    }

    return compareVersion(aa, bb);
  });
}
