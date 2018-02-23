import Ember from 'ember';
import Prettycron from 'npm:prettycron';

function prettyCronHelper(param) {
  if (!param[0]) {
    return '';
  }
  return Prettycron[param[1]](param[0]);
}
export default Ember.Helper.helper(prettyCronHelper);
