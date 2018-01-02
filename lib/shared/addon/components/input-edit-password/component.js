import Component from '@ember/component';
import layout from './template';
import { alias, equal } from '@ember/object/computed';
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
  user: null,
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
        get(this, 'user').doAction('changepassword', {newPassword: get(this, 'password')})
          .then(( user ) => {
            cb(user);
            this.sendAction('complete', user);
          }).catch((/* res */) => {
            this.sendAction('complete', false);
          });
      }
    },
  }
});
