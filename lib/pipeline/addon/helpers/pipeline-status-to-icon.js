import Ember from 'ember';

function classForStatus(status) {
  switch (status[0]) {
    case 'Success':
      return 'icon-check';
    case 'Building':
      return 'icon-circle';
    case 'Fail':
      return 'icon-close';
    case 'Waitting':
      return '';
    default:
      return '';
  }
}
export default Ember.Helper.helper(classForStatus);
