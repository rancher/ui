import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import C from 'ui/utils/constants';

export default Controller.extend({
  router: service(),
  complete(success) {
    let backTo = get(this, 'session').get(C.SESSION.BACK_TO)
    let router = get(this, 'router');
    if (success) {
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
