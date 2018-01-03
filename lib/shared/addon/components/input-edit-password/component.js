import Component from '@ember/component';
import layout from './template';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';

export default Component.extend({
  intl: service(),
  layout,

  password: null,
  confirm: null,
  overrideSave: null,
  user: null,

  confirmBlurred: false,

  didReceiveAttrs() {
    run.next(function() {
      $('.start')[0].focus();
    });
  },

  saveDisabled: computed('password','confirm', function() {
    const pass = get(this, 'password');
    const confirm = get(this, 'confirm');

    return !pass || !confirm || pass !== confirm;
  }),

  errors: computed('saveDisabled', 'confirm', 'confirmBlurred', function() {
    let out = [];
    if ( get(this, 'confirmBlurred') && get(this, 'confirm') && get(this, 'saveDisabled') ) {
      out.push(get(this, 'intl').t('modalEditPassword.mismatch'));
    }

    return out;
  }),

  actions: {
    blurredConfirm() {
      set(this, 'confirmBlurred', true);
    },

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
