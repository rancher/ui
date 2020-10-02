import Mixin from '@ember/object/mixin';
import { computed, get } from '@ember/object';

export default Mixin.create({
  principalIdReference: computed('groupPrincipalId.length', 'userId.length', 'userPrincipalId.length', function(){
    if (get(this, 'userPrincipalId.length') > 0) {
      return get(this, 'userPrincipalId');
    }

    if (get(this, 'groupPrincipalId.length') > 0) {
      return get(this, 'groupPrincipalId');
    }

    if (get(this, 'userId.length') > 0) {
      // TODO temp fix until craig switches PRTB/CRTP to use principalId. userId is only set for local users and only when the user creates a cluster.
      return `local://${ get(this, 'userId') }`;
    }

    return '';
  }),
});
