import Ember from 'ember';
import C from 'ui/utils/constants';
export function parseHostIcon(params/*, hash*/) {
  return C.MACHINE_DRIVER_IMAGES[(params[0]||'other').toUpperCase()] || 'other';
}

export default Ember.Helper.helper(parseHostIcon);
