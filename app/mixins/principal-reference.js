import Mixin from '@ember/object/mixin';
import { computed, get } from '@ember/object';

export default Mixin.create({
  principalIdReference: computed('userPrincipalId', 'groupPrincipalId', function(){

    if (get(this, 'userPrincipalId.length') > 0) {
      return get(this, 'userPrincipalId');
    }

    if (get(this, 'groupPrincipalId.length') > 0) {
      return get(this, 'groupPrincipalId');
    }
  }),
});
