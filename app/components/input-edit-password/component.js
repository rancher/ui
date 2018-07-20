import Component from '@ember/component';
import layout from './template';
import { get, set, computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { later, run } from '@ember/runloop';
import { randomStr } from 'shared/utils/util';

const CHANGE = 'change';
const SET = 'set';

export default Component.extend({
  intl:        service(),
  globalStore: service(),
  session:     service(),
  router:      service(),
  access:      service(),

  layout,
  showCurrent:     true,
  generate:        false,
  setOrChange:     CHANGE,
  editLabel:       'modalEditPassword.actionButton',
  currentPassword: null,
  user:            null,

  confirmBlurred: false,
  serverErrors:   null,
  password:       null,
  confirm:        null,

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

      return promise.then(() => get(this, 'access').loadMe()
        .then(() => {
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
      set(this, 'password', randomStr(16, 'password'));
    } else {
      set(this, 'password', '');
      set(this, 'confirm', '');
      run.next(this, 'focusStart');
    }
  }),

  saveDisabled: computed('generate', 'password', 'confirm', function() {
    if ( get(this, 'generate') ) {
      return false;
    }

    const pass = (get(this, 'password') || '').trim();
    const confirm = (get(this, 'confirm') || '').trim();

    return !pass || !confirm || pass !== confirm;
  }),

  errors: computed('saveDisabled', 'confirm', 'confirmBlurred', 'serverErrors.[]', function() {
    let out = get(this, 'serverErrors') || [];

    if ( get(this, 'confirmBlurred') && get(this, 'confirm') && get(this, 'saveDisabled') ) {
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
