import { inject as service } from '@ember/service';
import { get, set, computed } from '@ember/object';
import { hasMany } from 'ember-api-store/utils/denormalize';
import { next } from '@ember/runloop'
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  router:      service(),
  globalStore: service(),
  access:      service(),

  globalRoleBindings:  hasMany('id', 'globalRoleBinding', 'userId'),
  clusterRoleBindings: hasMany('id', 'clusterRoleTemplateBinding', 'userId'),
  projectRoleBindings: hasMany('id', 'projectRoleTemplateBinding', 'userId'),

  combinedState: computed('enabled', 'state', function() {
    if ( get(this, 'enabled') === false ) {
      return 'inactive';
    } else {
      return get(this, 'state');
    }
  }),

  displayName: computed('name', 'username', 'id', function() {
    let name = get(this, 'name');

    if ( name ) {
      return name;
    }

    name = get(this, 'username');
    if ( name ) {
      return name;
    }

    return `(${  get(this, 'id')  })`;
  }),

  avatarSrc: computed('id', function() {
    return `data:image/png;base64,${  new Identicon(AWS.util.crypto.md5(this.get('id') || 'Unknown', 'hex'), 80, 0.01).toString() }`;
  }),

  hasAdmin: computed('globalRoleBindings.[]', function() {
    return get(this, 'globalRoleBindings').findBy('globalRole.isAdmin', true);
  }),

  hasCustom: computed('globalRoleBindings.[]', function() {
    return get(this, 'globalRoleBindings').findBy('globalRole.isCustom', true);
  }),

  hasUser: computed('globalRoleBindings.[]', function() {
    return get(this, 'globalRoleBindings').findBy('globalRole.isUser', true);
  }),

  hasBase: computed('globalRoleBindings.[]', function() {
    return get(this, 'globalRoleBindings').findBy('globalRole.isBase', true);
  }),

  isMe: computed('access.principal', function() {
    return get(this, 'access.principal.id') === get(this, 'id');
  }),

  availableActions: computed('enabled', function() {
    const on = get(this, 'enabled') !== false;

    return [
      {
        label:    'action.activate',
        icon:     'icon icon-play',
        action:   'activate',
        bulkable: true,
        enabled:  !on,
      },
      {
        label:    'action.deactivate',
        icon:     'icon icon-pause',
        action:   'deactivate',
        bulkable: true,
        enabled:  on,
      },
    ];
  }),

  actions: {
    deactivate() {
      next(() => {
        set(this, 'enabled', false);
        this.save();
      });
    },

    activate() {
      next(() => {
        set(this, 'enabled', true);
        this.save();
      });
    },

    edit() {
      get(this, 'router').transitionTo('global-admin.accounts.edit', get(this, 'id'));
    },

    setPassword(password) {
      this.doAction('setpassword', { newPassword: password });
    }
  },

});
