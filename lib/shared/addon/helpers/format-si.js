import Ember from 'ember';
import Util from 'ui/utils/util';

export function formatSi(params, options) {
  return Util.formatSi(params[0], options.increment, options.suffix, options.firstSuffix, options.startingExponent);
}

export default Ember.Helper.helper(formatSi);
