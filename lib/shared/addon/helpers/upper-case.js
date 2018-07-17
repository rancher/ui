import { helper } from '@ember/component/helper';

export function upperCase(params) {
  return (params[0] || '').toUpperCase();
}

export default helper(upperCase);
