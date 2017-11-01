import Helper from '@ember/component/helper';
import C from 'shared/utils/constants';

export function authType(type /*, hash*/) {
  return C.AUTH_TYPES[type];
}

export default Helper.helper(authType);
