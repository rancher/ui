import { helper } from '@ember/component/helper';

export function hasProperty(params) {
  return Object.prototype.hasOwnProperty.call(params[0], params[1]);
}

export default helper(hasProperty);
