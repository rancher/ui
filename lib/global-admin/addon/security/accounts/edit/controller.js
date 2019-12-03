import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get, set } from '@ember/object';
import {  resolve } from 'rsvp';
import NewOrEdit from 'shared/mixins/new-or-edit';


export default Controller.extend(NewOrEdit, {
  access:          service(),
  globalStore:     service(),
  intl:            service(),

  password:        '',
  confirm:         '',
  globalRoleSave:  null,
  canUserLogIn:    null,

  primaryResource: alias('model.user'),

  actions:         {
    cancel() {
      this.transitionToRoute('security.accounts.users');
    },

    setGlobalRoleSave(fn) {
      set(this, 'globalRoleSave', fn);
    },

    setValidateGlobalRoles(fn) {
      set(this, 'canUserLogIn', fn);
    }
  },

  isLocalUser:     computed('primaryResource.username', function() {
    return get(this, 'primaryResource.username') ? true : false;
  }),

  passwordsMatch: computed('password', 'confirm', function() {
    return get(this, 'password') === get(this, 'confirm');
  }),

  passwordsMismatch: computed('passwordsMatch', function() {
    return !get(this, 'passwordsMatch');
  }),

  willSave() {
    set(this, 'errors', null);

    let errors = [];
    let ok     = this.validate();

    if (this.canUserLogIn && !this.canUserLogIn()) {
      errors.push(this.intl.t('formGlobalRoles.loginError', { type: 'user' }));
    }

    if (!ok) {
      return false;
    }

    if (get(this, 'password.length') > 0 && (get(this, 'password') || '').trim().length === 0) {
      errors.push(get(this, 'intl').t('accountsPage.new.errors.pwReq'));
    }

    if (errors.length) {
      set(this, 'errors', errors.uniq());

      return false;
    } else {
      set(this, 'errors', null);
    }

    return true;
  },

  didSave() {
    this._super(...arguments);

    let promise = resolve();

    if (get(this, 'password.length') > 0) {
      promise = get(this, 'primaryResource').doAction('setpassword', { newPassword: get(this, 'password').trim() });
    }

    return promise.then(() => {
      return this.globalRoleSave();
    });
  },

  doneSaving() {
    this.transitionToRoute('security.accounts.users');
  },
});
