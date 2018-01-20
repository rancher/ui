import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import { hasMany } from 'ember-api-store/utils/denormalize';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  router: service(),
  globalStore: service(),

  globalRoleBindings: hasMany('id', 'globalRoleBinding', 'subjectName', 'globalStore', function(x) {
    return get(x, 'subjectKind') === 'User';
  }),

  displayName: computed('name','username','id', function() {
    let name = get(this, 'name');
    if ( name ) {
      return name;
    }

    name = get(this, 'username');
    if ( name ) {
      return name;
    }

    return '(' + get(this,'id') + ')';
  }),

  hasAdmin: computed('globalRoleBindings.[]', function() {
    if ( get(this, 'globalRoleBindings').findBy('globalRole.isAdmin', true) ) {
      return true;
    }

    return false;
  }),

  hasCustom: computed('globalRoleBindings.[]', function() {
    if ( get(this, 'globalRoleBindings').findBy('globalRole.isCustom', true) ) {
      return true;
    }

    return false;
  }),

  hasUser: computed('globalRoleBindings.[]', function() {
    if ( get(this, 'globalRoleBindings').findBy('globalRole.isUser', true) ) {
      return true;
    }

    return false;
  }),

  hasBase: computed('globalRoleBindings.[]', function() {
    if ( get(this, 'globalRoleBindings').findBy('globalRole.isBase', true) ) {
      return true;
    }

    return false;
  }),

  clusterRoleBindings: hasMany('id', 'clusterRoleTemplateBinding', 'subjectName', 'globalStore', function(x) {
    return get(x, 'subjectKind') === 'User';
  }),

  projectRoleBindings: hasMany('id', 'projectRoleTemplateBinding', 'subjectName', 'globalStore', function(x) {
    return get(x, 'subjectKind') === 'User';
  }),

  actions: {
    deactivate() {
      return this.doAction('deactivate');
    },

    activate() {
      return this.doAction('activate');
    },

    edit: function() {
      get(this, 'router').transitionTo('global-admin.accounts.edit', get(this, 'id'));
    },

    setPassword(password) {
      this.doAction('setpassword', {newPassword: password});
    }
  },

  availableActions: computed('actionLinks.{activate,deactivate,restore}','links.{update,remove}', function() {
    let a = this.get('actionLinks');
    let l = this.get('links');

    return [
      { label: 'action.edit',       icon: 'icon icon-edit',         action: 'edit',         enabled: !!l.update },
      { divider: true },
      { label: 'action.activate',   icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate , bulkable: true},
      { label: 'action.deactivate', icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate , bulkable: true},
      { divider: true },
      { label: 'action.remove',     icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];
  }),
});
