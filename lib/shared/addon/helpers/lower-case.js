import { helper } from '@ember/component/helper';

export function lowerCase(params) {
  return (params[0] || '').toLowerCase();
}

export default helper(lowerCase);
