import { helper } from '@ember/component/helper';
import Util from 'ui/utils/util';
import { htmlSafe } from '@ember/string';

export function parseCamelcase(params) {
  return new htmlSafe(Util.parseCamelcase(params[0]));
}

export default helper(parseCamelcase);