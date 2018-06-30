import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import {
  set, get, computed
} from '@ember/object';
import { alias } from '@ember/object/computed';
import C from 'ui/utils/constants';

export default Controller.extend({
  router:   service(),
  access:   service(),
  settings: service(),

  showCurrent: null,

  init() {

    this._super(...arguments);
    set(this, 'showCurrent', !get(this, 'access.userCode.password'));

  },
  firstLogin: alias('access.firstLogin'),

  currentPassword: computed('', function() {

    return get(this, 'access.userCode.password') || null;

  }),
  complete(success) {

    let backTo = get(this, 'session').get(C.SESSION.BACK_TO)
    let router = get(this, 'router');

    if (success) {

      get(this, 'access').set('firstLogin', false);
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
