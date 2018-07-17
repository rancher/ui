import { helper } from '@ember/component/helper';
import Util from 'ui/utils/util';

export function formatMib(params/* , options*/) {
  return Util.formatMib(params[0]);
}

export default helper(formatMib);
