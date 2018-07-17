import { helper } from '@ember/component/helper';

export function strReplace(params, options) {
  return (`${ params[0] }`).replace(options.match, options.with);
}

export default helper(strReplace);
