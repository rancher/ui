import Ember from 'ember';
import Util from 'ui/utils/util';

export function ucFirst(params) {
 return Util.ucFirst(params[0]);
}

export default Ember.Helper.helper(ucFirst);
