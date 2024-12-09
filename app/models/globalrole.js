import { not } from '@ember/object/computed';
import Resource from 'ember-api-store/models/resource';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { hasMany } from 'ember-api-store/utils/denormalize';

const BASE = 'user-base';
const USER = 'user';
const ADMIN = 'admin';
const SPECIAL = [BASE, ADMIN, USER];

export default Resource.extend({

  access:             service(),
  intl:               service(),
  router:             service(),
  globalRoleBindings: hasMany('id', 'globalRoleBinding', 'globalRoleId'),

  // I think its safe to hack around this - wjw
  _displayState: 'active',
  // because of this the state shows as "Unknown" with bright yellow background
  stateColor:    'text-success',

  canRemove: not('builtin'),

  canClone: computed('access.me', 'id', function() {
    return this.access.allows('globalrole', 'create', 'global');
  }),

  isHidden: computed('id', function() {
    return SPECIAL.includes(this.id);
  }),

  isBase: computed('id', function() {
    return this.id === BASE;
  }),

  isUser: computed('id', function() {
    return this.id === USER;
  }),

  isAdmin: computed('id', function() {
    return this.id === ADMIN;
  }),

  isCustom: computed('isAdmin', 'isUser', 'isBase', function() {
    return !this.isAdmin && !this.isBase && !this.isUser;
  }),

  globalRoleAssociatedUserCount: computed('globalRoleBindings.@each.{id,state,newUserDefault}', function() {
    return ( this.globalRoleBindings || [] ).length;
  }),

  displayName: computed('id', 'name', 'intl.locale', function() {
    const intl = this.intl;
    const id = this.id;
    const key = `formGlobalRoles.role.${ id }.label`;

    if ( intl.exists(key) ){
      return intl.t(key);
    }

    const name = this.name;

    if ( name ) {
      return name;
    }

    return `(${ id })`;
  }),

  detail: computed('id', 'intl.locale', 'name', function() {
    const intl = this.intl;
    const id = this.id;
    const key = `formGlobalRoles.role.${ id }.detail`;

    if ( intl.exists(key) ){
      return intl.t(key);
    }

    return intl.t('formGlobalRoles.mode.userCreated.noDescription');
  }),


  // globalRoles can not be removed or changed as of now and do not have a state
  actions: {
    edit() {
      this.router.transitionTo('global-admin.security.roles.edit', this.id, { queryParams: { type: 'global' } });
    },

    clone() {
      this.router.transitionTo('global-admin.security.roles.new', {
        queryParams: {
          context: 'global',
          id:      this.id
        }
      });
    }
  }
});
