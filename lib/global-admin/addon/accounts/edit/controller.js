import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get, set } from '@ember/object';
import {  resolve } from 'rsvp';
import NewOrEdit from 'shared/mixins/new-or-edit';


export default Controller.extend(NewOrEdit,{
  access:          service(),
  globalStore:     service(),
  primaryResource: alias('model.user'),
  password:        "",
  confirm:         "",

  globalRoleSave: null,

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
    }
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
