import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get } from '@ember/object';
import {all} from 'rsvp';

export default Controller.extend({
  access: service(),
  globalStore: service(),
  primaryResource:    alias('model.user'),
  globalRoles: alias('model.myGlobalRoles'),
  passwordsMatch: computed('password', 'confirm', function() {
    return get(this, 'password') === get(this, 'confirm') || (get(this, 'password') === '' && get(this, 'confirm') === '');
  }),
  password: null,
  confirm: null,
  sortBy: 'name',
  myGlobalRoles: computed('model.globalRoles.[]', 'model.globalRoleBindings.[]', function() {
    let userRoles = get(this, 'model.globalRoleBindings');
    let neu = [];
    // TODO 2.0 is this the best way to find the matches?
    get(this, 'model.globalRoles').forEach((grb) => {
      let tmp = {name: get(grb, 'name'), active: false, globalId: get(grb, 'id')};
      let userRole = userRoles.findBy('globalRoleId', get(grb, 'id'));
      if (userRole) {
        tmp.active=true;
        tmp.binding = userRole;
      }
      neu.push(tmp);
    });

    return neu;
  }),
  actions: {
    doSave(cb) {
      let promises = [];
      let store = get(this, 'globalStore');

      if (get(this, 'password.length') > 0) {
        promises.push(get(this, 'globalStore').rawRequest({
          url: 'users/admin?action=changepassword', // TODO 2.0
          method: 'POST',
          data: {
            newPassword: get(this, 'password')
          }
        }));
      }

      get(this, 'myGlobalRoles').forEach((role) => {
        let promise;
        if (get(role, 'active') && !get(role, 'binding')) { // new role for user
          promise = store.createRecord({
            type: 'globalRoleBindings',
            globalRoleId: get(role, 'globalId'),
            subjectName: get(this, 'model.user.principalIds.firstObject'), // TODO 2.0
            subjectKind: 'user', // TODO 2.0
          }).save();
          promises.push(promise);
        } else if (!get(role, 'active') && get(role, 'binding')) { //active role removed
          promise = store.rawRequest({
            url: `globalRoleBindings/${get(role, 'binding.id')}`,
            method: 'DELETE'
          });
          promises.push(promise);
        }
      });
      all(promises.compact()).then((/* list */) => {
        cb(true);
        this.transitionToRoute('accounts');
      }).catch((err) => {
        cb(false);
        get(this, 'errors').push(err);
      });
    },
  },

  headers:  [
    {
      name:           'name',
      sort:           ['name'],
      translationKey: 'accountsPage.detail.table.headers.role',
      // width:          125,
    },
    {
      name:           'active',
      sort:           ['active'],
      translationKey: 'accountsPage.detail.table.headers.active',
      // width:          125,
    },
  ],



  init() {
    this._super(...arguments);
    this.setProperties({
      password: '',
      confirm: '',
    });
  },

  validate() {
    var errors = [];
    // var neu = this.get('password');
    // var neu2 = this.get('confirm');

    // if ( neu || neu2 )
    // {
    //   if ( this.get('needOld') && !old )
    //   {
    //     errors.push('Current password is required');
    //   }

    //   if ( this.get('showConfirm') && neu !== neu2 )
    //   {
    //     errors.push('New passwords do not match');
    //   }
    // }

    // if ( errors.length )
    // {
    //   this.set('errors', errors);
    //   return false;
    // }

    return true;
  },


  // didSave() {
  // },

  // doneSaving() {
  //   this.send('cancel');

  //   return resolve();
  // },
});
