import Resource from '@rancher/ember-api-store/models/resource';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { hasMany } from '@rancher/ember-api-store/utils/denormalize';

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

  canClone: computed('access.me', 'id', function() {
    return this.access.allows('globalrole', 'create', 'global');
  }),

  canRemove: computed('id', 'builtin', function() {
    return !this.builtin;
  }),

  isHidden: computed('id', function() {
    return SPECIAL.includes(get(this, 'id'));
  }),

  isBase: computed('id', function() {
    return get(this, 'id') === BASE;
  }),

  isUser: computed('id', function() {
    return get(this, 'id') === USER;
  }),

  isAdmin: computed('id', function() {
    return get(this, 'id') === ADMIN;
  }),

  isCustom: computed('isAdmin', 'isUser', 'isBase', function() {
    return !get(this, 'isAdmin') && !get(this, 'isBase') && !get(this, 'isUser');
  }),

  globalRoleAssociatedUserCount: computed('globalRoleBindings.@each.{id,state,newUserDefault}', function() {
    return ( get(this, 'globalRoleBindings') || [] ).length;
  }),

  displayName: computed('id', 'name', 'intl.locale', function() {
    const intl = get(this, 'intl');
    const id = get(this, 'id');
    const key = `formGlobalRoles.role.${ id }.label`;

    if ( intl.exists(key) ){
      return intl.t(key);
    }

    const name = get(this, 'name');

    if ( name ) {
      return name;
    }

    return `(${ id })`;
  }),

  detail: computed('name', 'intl.locale', function() {
    const intl = get(this, 'intl');
    const id = get(this, 'id');
    const key = `formGlobalRoles.role.${ id }.detail`;

    if ( intl.exists(key) ){
      return intl.t(key);
    }

    return intl.t('formGlobalRoles.mode.userCreated.noDescription');
  }),


  // globalRoles can not be removed or changed as of now and do not have a state
  actions: {
    edit() {
      this.get('router').transitionTo('global-admin.security.roles.edit', this.get('id'), { queryParams: { type: 'global' } });
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
