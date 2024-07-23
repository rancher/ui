import Component from '@ember/component';
import layout from './template';
import { set, computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { later, run } from '@ember/runloop';
import { randomStr } from 'shared/utils/util';
import { resolve, all } from 'rsvp';

const CHANGE = 'change';
const SET = 'set';

export default Component.extend({
  intl:        service(),
  globalStore: service(),
  session:     service(),
  router:      service(),
  access:      service(),

  layout,
  showCurrent:       true,
  generate:          false,
  setOrChange:       CHANGE,
  editLabel:         'modalEditPassword.actionButton',
  currentPassword:   null,
  user:              null,
  showDeleteTokens:  false,
  forceSaveDisabled: false,

  confirmBlurred:   false,
  serverErrors:     null,
  password:         null,
  confirm:          null,
  deleteTokens:     false,

  didReceiveAttrs() {
    if ( this.generate ) {
      this.send('regenerate');
    }

    run.next(this, 'focusStart');
  },

  actions: {
    regenerate() {
      this.generateChanged();
    },

    blurredConfirm() {
      set(this, 'confirmBlurred', true);
    },

    save(cb) {
      const user = this.user;
      const old = this.currentPassword || '';
      const neu = this.password || '';

      set(this, 'serverErrors', []);

      const setOrChange = this.setOrChange;
      let promise;

      if ( setOrChange === CHANGE ) {
        // @TODO-2.0 better way to call collection actions
        promise = this.globalStore.request({
          url:    '/v3/users?action=changepassword',
          method: 'POST',
          data:   {
            currentPassword: old.trim(),
            newPassword:     neu.trim()
          }
        });
      } else if ( setOrChange === SET ) {
        promise = user.doAction('setpassword', { newPassword: neu.trim(), });
      }

      return promise.then(() => this.access.loadMe().then(() => {
        if ( this.deleteTokens ) {
          return this.globalStore.findAll('token').then((tokens) => {
            const promises = [];

            tokens.forEach((token) => {
              if ( !token.current ) {
                promises.push(token.delete());
              }
            });

            return all(promises).catch(() => resolve());
          });
        } else {
          return resolve();
        }
      }).then(() => {
        this.complete(true);
        later(this, () => {
          if ( this.isDestroyed || this.isDestroying ) {
            return;
          }
          cb(true);
        }, 1000);
      })).catch((err) => {
        set(this, 'serverErrors', [err.message]);
        this.complete(false);
        cb(false);
      });
    },
  },
  generateChanged: observer('generate', function() {
    if ( this.generate ) {
      set(this, 'password', randomStr(16, 16, 'password'));
    } else {
      set(this, 'password', '');
      set(this, 'confirm', '');
      run.next(this, 'focusStart');
    }
  }),

  saveDisabled: computed('generate', 'passwordsMatch', 'forceSaveDisabled', 'showCurrent', 'currentPassword', function() {
    if ( this.forceSaveDisabled ) {
      return true;
    }

    if ( this.showCurrent && !this.currentPassword ) {
      return true;
    }

    if ( this.generate ) {
      return false;
    }

    return !this.passwordsMatch;
  }),

  passwordsMatch: computed('password', 'confirm', function() {
    const pass = (this.password || '').trim();
    const confirm = (this.confirm || '').trim();

    return pass && confirm && pass === confirm;
  }),

  errors: computed('passwordsMatch', 'confirm', 'confirmBlurred', 'serverErrors.[]', function() {
    let out = this.serverErrors || [];

    if ( this.confirmBlurred && this.confirm && !this.passwordsMatch ) {
      out.push(this.intl.t('modalEditPassword.mismatch'));
    }

    return out;
  }),

  focusStart() {
    const elem = $('.start')[0]; // eslint-disable-line

    if ( elem ) {
      elem.focus();
    }
  },

});
