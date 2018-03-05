import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get, set } from '@ember/object';
import {  resolve } from 'rsvp';
import NewOrEdit from 'shared/mixins/new-or-edit';


export default Controller.extend(NewOrEdit,{
  access:             service(),
  globalStore:        service(),
  intl:               service(),
  primaryResource:    alias('model.user'),
  password:           "",
  confirm:            "",

  globalRoleSave:     null,
  globalRoleValidate: null,

  passwordsMatch: computed('password', 'confirm', function() {
    return get(this, 'password') === get(this, 'confirm');
  }),

  passwordsMismatch: computed('passwordsMatch', function() {
    return !get(this, 'passwordsMatch');
  }),

  actions: {
    cancel() {
      this.transitionToRoute('accounts');
    },

    setGlobalRoleSave(fn) {
      set(this, 'globalRoleSave', fn);
    },
    setGlobalRoleValidate(fn) {
      set(this, 'globalRoleValidate', fn);
    }
  },

  willSave() {
    set(this, 'errors', null);

    let errors  = [];
    let ok      = this.validate();
    let rolesOk = this.globalRoleValidate();

    if (!ok) {
      return false;
    }

    if (!rolesOk) {
      errors.push(get(this, 'intl').findTranslationByKey('accountsPage.new.errors.role'));
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
      promise = get(this, 'primaryResource').doAction('setpassword', {newPassword: get(this, 'password')});
    }

    return promise.then(() => {
      return this.globalRoleSave();
    });
  },

  doneSaving() {
    this.transitionToRoute('accounts');
  },
});
