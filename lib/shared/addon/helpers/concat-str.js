import Helper from '@ember/component/helper';
import { isArray } from '@ember/array';

export function concatStr(params, hash) {
  let chr = (hash.character === undefined ? ' ' : hash.character);

  if ( isArray(params[0]) ) {
    return params[0].join(chr);
  } else {
    return params.join(chr);
  }
}

export default Helper.helper(concatStr);
