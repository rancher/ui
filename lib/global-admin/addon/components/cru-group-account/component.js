import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';

const HEADERS = [
  {
    name:           'active',
    sort:           ['active'],
    translationKey: 'accountsPage.detail.table.headers.active',
    width:          125,
  },
  {
    name:           'name',
    sort:           ['name'],
    translationKey: 'accountsPage.detail.table.headers.role',
  }
];

export default Component.extend({
  globalStore:      service(),
  settings:         service(),
  intl:             service(),
  router:           service(),

  layout,

  sortBy:           'name',
  mode:             'new',

  globalRoleSave:   null,
  canUserLogIn:     null,
  groupPrincipalId: null,

  headers:          HEADERS,

  init() {
    this._super(...arguments);

    if (this.model.principal && this.mode === 'edit') {
      set(this, 'groupPrincipalId', this.model.principal.id);
    }
  },


  actions:         {
    addGroup(group) {
      if (group) {
        set(this, 'groupPrincipalId', group.id);
      }
    },
    save(cb) {
      if (!this.validate()) {
        return cb(false);
      }

      return this.globalRoleSave().then(() => {
        cb(true);
        this.doneSaving();
      });
    },
    cancel() {
      this.router.transitionTo('global-admin.security.accounts.groups');
    },

    setGlobalRoleSave(fn) {
      set(this, 'globalRoleSave', fn);
    },

    setValidateGlobalRoles(fn) {
      set(this, 'canUserLogIn', fn);
    }
  },

  roles: computed('model.globalRoles.[]', function() {
    return ( this.model.globalRoles || [] ).map((grb) => {
      return {
        name:     get(grb, 'name'),
        active:   false,
        globalId: get(grb, 'id')
      };
    });
  }),

  validate() {
    var errors = [];

    if (!this.groupPrincipalId) {
      errors.push(this.intl.t('accountsPage.newGroup.errors.group'));
    }

    if (this.canUserLogIn && !this.canUserLogIn()) {
      errors.push(this.intl.t('formGlobalRoles.loginError', { type: this.intl.t('generic.group') }));
    }

    if (errors.length) {
      set(this, 'errors', errors.uniq());

      return false;
    }

    set(this, 'errors', null);

    return true;
  },

  doneSaving() {
    this.router.transitionTo('global-admin.security.accounts.groups');
  }
});
