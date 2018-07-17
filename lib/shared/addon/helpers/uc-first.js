import { helper } from '@ember/component/helper';
import Util from 'ui/utils/util';

export function ucFirst(params) {
  return Util.ucFirst(params[0]);
}

export default helper(ucFirst);
