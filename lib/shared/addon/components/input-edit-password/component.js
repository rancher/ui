import Component from '@ember/component';
import layout from './template';
import { equal } from '@ember/object/computed';
import { get/* , set */ } from '@ember/object';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';

export default Component.extend({
  layout,
  password: null,
  confirm: null,
  canSave: equal('password', 'confirm'),
  overrideSave: null,
  globalStore: service(),
  didReceiveAttrs() {
    run.next(function() {
      $('.start')[0].focus();
    });
  },
  actions: {
    save(cb) {
      if (typeof get(this, 'overrideSave') === 'function') {
        this.sendAction('overrideSave', get(this, 'password'));
      } else {
        get(this, 'globalStore').rawRequest({
          url: 'users/admin?action=changepassword', // TODO 2.0
          method: 'POST',
          data: {
            newPassword: get(this, 'password')
          }
        }).then((/* resp */) => {
          cb(true);
          this.sendAction('complete', true);
        }).catch((/* res */) => {
          this.sendAction('complete', false);
        });
      }
    },
  }
});
