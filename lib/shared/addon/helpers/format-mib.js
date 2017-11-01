import Ember from 'ember';
import Util from 'ui/utils/util';

export function formatMib(params/*, options*/) {
  return Util.formatMib(params[0]);
}

export default Ember.Helper.helper(formatMib);
