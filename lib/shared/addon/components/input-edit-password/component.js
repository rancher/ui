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
  globalStore: service(),
  didReceiveAttrs() {
    run.next(function() {
      $('.start')[0].focus();
    });
  },
  actions: {
    save(cb) {
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
    },
  }
});
