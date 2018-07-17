import { helper } from '@ember/component/helper';

export function defaultStr(params, options) {
  var out = null;
  var i = 0;

  while ( !out && i < params.length) {
    out = params[i];
    i++;
  }

  if ( !out && options && options.default) {
    out = options.default;
  }

  return out;
}

export default helper(defaultStr);
