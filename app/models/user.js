import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import { hasMany } from 'ember-api-store/utils/denormalize';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  globalRoleBindings: hasMany('id', 'globalRoleBinding', 'userId'),

  clusterRoleBindings: hasMany('id', 'clusterRoleTemplateBinding', 'userId'),

  projectRoleBindings: hasMany('id', 'projectRoleTemplateBinding', 'userId'),

  avatarSrc: function() {

    return `data:image/png;base64,${  new Identicon(AWS.util.crypto.md5(this.get('id') || 'Unknown', 'hex'), 80, 0.01).toString() }`;

  }.property('id'),

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

  availableActions: computed('actionLinks.{activate,deactivate}', function() {

    let a = this.get('actionLinks');

    return [
      {
        label:    'action.activate',
        icon:     'icon icon-play',
        action:   'activate',
        enabled:  !!a.activate,
        bulkable: true
      },
      {
        label:    'action.deactivate',
        icon:     'icon icon-pause',
        action:   'deactivate',
        enabled:  !!a.deactivate,
        bulkable: true
      },
    ];

  }),
  router:      service(),
  globalStore: service(),
  access:      service(),

  actions: {
    deactivate() {

      return this.doAction('deactivate');

    },

    activate() {

      return this.doAction('activate');

    },

    edit() {

      get(this, 'router').transitionTo('global-admin.accounts.edit', get(this, 'id'));

    },

    setPassword(password) {

      this.doAction('setpassword', { newPassword: password });

    }
  },

});
