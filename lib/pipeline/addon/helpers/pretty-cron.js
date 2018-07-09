import Helper from '@ember/component/helper';
import Prettycron from 'npm:prettycron';

function prettyCronHelper(param) {

  if (!param[0]) {

    return '';

  }

  return Prettycron[param[1]](param[0]);

}
export default Helper.helper(prettyCronHelper);
