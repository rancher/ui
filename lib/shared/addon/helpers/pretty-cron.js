import Helper from '@ember/component/helper';

const Prettycron = window.Prettycron;

function prettyCronHelper(param) {
  if (!param[0]) {
    return '';
  }

  return Prettycron[param[1]](param[0]);
}
export default Helper.helper(prettyCronHelper);
