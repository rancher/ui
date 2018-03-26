import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import C from 'ui/utils/constants';

export default Controller.extend({
  router: service(),
  access: service(),
  showCurrent: computed('access.userCode.password', function() {
    if (get(this, 'access.userCode.password')) {
      return false;
    }
    return true;
  }),
  currentPassword: computed('', function() {
    return get(this, 'access.userCode.password') || null;
  }),
  complete(success) {
    let backTo = get(this, 'session').get(C.SESSION.BACK_TO)
    let router = get(this, 'router');
    if (success) {
      get(this, 'access').set('userCode', null);
      if ( backTo ) {
        // console.log('Going back to', backTo);
        window.location.href = backTo;
      } else {
        // console.log('Replacing Authenticated');
        router.replaceWith('authenticated');
      }
    }
  },
});
