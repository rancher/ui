import Helper from '@ember/component/helper';

export function dateDuration(params) {
  return Math.round(moment.duration(params[0], 'ms').as('s'));
}

export default Helper.helper(dateDuration);
