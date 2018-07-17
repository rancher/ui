import Helper from '@ember/component/helper';

function classForStatus(status) {
  switch (status[0]) {
  case 'Success':
    return 'icon icon-check';
  case 'Building':
    return 'icon icon-circle';
  case 'Fail':
    return 'icon icon-close';
  case 'Waitting':
    return '';
  default:
    return '';
  }
}
export default Helper.helper(classForStatus);
