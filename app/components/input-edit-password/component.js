import Component from '@ember/component';
import layout from './template';
import { get, set, computed, observer } from '@ember/object';
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
    if ( get(this, 'generate') ) {
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
      const user = get(this, 'user');
      const old = get(this, 'currentPassword') || '';
      const neu = get(this, 'password') || '';

      set(this, 'serverErrors', []);

      const setOrChange = get(this, 'setOrChange');
      let promise;

      if ( setOrChange === CHANGE ) {
        // @TODO-2.0 better way to call collection actions
        promise = get(this, 'globalStore').request({
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

      return promise.then(() => get(this, 'access').loadMe().then(() => {
        if ( get(this, 'deleteTokens') ) {
          return get(this, 'globalStore').findAll('token').then((tokens) => {
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
        get(this, 'complete')(true);
        later(this, () => {
          if ( this.isDestroyed || this.isDestroying ) {
            return;
          }
          cb(true);
        }, 1000);
      })).catch((err) => {
        set(this, 'serverErrors', [err.message]);
        get(this, 'complete')(false);
        cb(false);
      });
    },
  },
  generateChanged: observer('generate', function() {
    if ( get(this, 'generate') ) {
      set(this, 'password', randomStr(16, 16, 'password'));
    } else {
      set(this, 'password', '');
      set(this, 'confirm', '');
      run.next(this, 'focusStart');
    }
  }),

  saveDisabled: computed('generate', 'passwordsMatch', 'forceSaveDisabled', 'showCurrent', 'currentPassword', function() {
    if ( get(this, 'forceSaveDisabled') ) {
      return true;
    }

    if ( get(this, 'showCurrent') && !get(this, 'currentPassword') ) {
      return true;
    }

    if ( get(this, 'generate') ) {
      return false;
    }

    return !get(this, 'passwordsMatch');
  }),

  passwordsMatch: computed('password', 'confirm', function() {
    const pass = (get(this, 'password') || '').trim();
    const confirm = (get(this, 'confirm') || '').trim();

    return pass && confirm && pass === confirm;
  }),

  errors: computed('passwordsMatch', 'confirm', 'confirmBlurred', 'serverErrors.[]', function() {
    let out = get(this, 'serverErrors') || [];

    if ( get(this, 'confirmBlurred') && get(this, 'confirm') && !get(this, 'passwordsMatch') ) {
      out.push(get(this, 'intl').t('modalEditPassword.mismatch'));
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
