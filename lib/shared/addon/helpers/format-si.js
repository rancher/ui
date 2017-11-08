import { helper } from '@ember/component/helper';
import Util from 'ui/utils/util';

export function formatSi(params, options) {
  return Util.formatSi(params[0], options.increment, options.suffix, options.firstSuffix, options.startingExponent);
}

export default helper(formatSi);
