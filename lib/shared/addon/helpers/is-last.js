import { helper } from '@ember/component/helper';
import { get } from '@ember/object';

export function isLast(params/*, hash*/) {
  let ary = params[0];
  let idx = params[1];

  return (idx+1) >= get(ary,'length');
}

export default helper(isLast);
