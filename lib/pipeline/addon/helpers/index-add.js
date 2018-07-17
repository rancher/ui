import Helper from '@ember/component/helper';

export function indexAdd(params) {
  return params[0] + 1;
}

export default Helper.helper(indexAdd);
