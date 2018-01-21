import Component from '@ember/component';
import layout from './template';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';

export default Component.extend({
  intl: service(),
  globalStore: service(),
  layout,

  inputCurrent: true,
  currentPassword: null,
  password: null,
  confirm: null,
  overrideSave: null,
  user: null,

  confirmBlurred: false,
  serverErrors: null,

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

  errors: computed('saveDisabled', 'confirm', 'confirmBlurred', 'serverErrors.[]', function() {
    let out = get(this, 'serverErrors')||[];

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
      const user = get(this, 'user');
      const old = get(this, 'currentPassword');
      const neu = get(this, 'password');

      set(this, 'serverErrors', []);

      if (typeof get(this, 'overrideSave') === 'function') {
        this.sendAction('overrideSave', get(this, 'password'));
//      } else if ( false && user.hasAction('setpassword') ) {
//        user.doAction('setpassword', {newPassword: neu})
//          .then(( user ) => {
//            cb(user);
//            this.sendAction('complete', user);
//          }).catch((/* res */) => {
//            this.sendAction('complete', false);
//          });
      } else {
        // @TODO-2.0 better way to call collection actions
        get(this, 'globalStore').request({
          url: '/v3/users?action=changepassword',
          method: 'POST',
          data: {
            currentPassword: old,
            newPassword: neu
          }
        }).then(() => {
          this.sendAction('complete', user);
        }).catch((err) => {
          set(this, 'serverErrors', [err.message]);
          this.sendAction('complete', false);
        }).finally(() => {
          cb();
        });
      }
    },
  }
});
