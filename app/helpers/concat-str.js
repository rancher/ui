import Ember from 'ember';

export function concatStr(params, hash) {
  let chr = (hash.character === undefined ? ' ' : hash.character);

  if ( Ember.isArray(params[0]) ) {
    return params[0].join(chr);
  } else {
    return params.join(chr);
  }
}

export default Ember.Helper.helper(concatStr);
