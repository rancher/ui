import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { hasMany } from 'ember-api-store/utils/denormalize';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import { reference } from 'ember-api-store/utils/denormalize';
import { alias } from '@ember/object/computed';

export default Resource.extend({
  access: service(),
  prefs: service(),
  scope: service(),
  settings: service(),
  modalService: service('modal'),
  router: service(),
  clusterStore: service(),

  type: 'project',
  name: null,
  description: null,

  cluster: reference('clusterId', 'cluster'),
  projectRoleTemplateBindings: hasMany('id', 'projectRoleTemplateBinding', 'projectId'), // 2.0 bug projectId is wrong in the ptrb should be <cluster-id>:<project-id> instead of just <project-id>
  roleTemplateBindings: alias('projectRoleTemplateBindings'),
  apps: hasMany('id', 'apps', 'projectId'),

  namespaces: hasMany('id', 'namespace', 'projectId'),

  actions: {
    edit: function () {
      get(this,'router').transitionTo('authenticated.cluster.projects.edit', get(this,'id'));
    },

    activate: function () {
      return this.doAction('activate');
    },

    deactivate: function () {
      return this.doAction('deactivate').then(() => {
        if ( get(this, 'scope.currentProject') === this ) {
          window.location.href = window.location.href;
        }
      });
    },

    setAsDefault: function () {
      set(get(this,'prefs'), C.PREFS.PROJECT_DEFAULT, get(this,'id'));
    },

    promptStop: function () {
      get(this,'modalService').toggleModal('modal-confirm-deactivate', {
        originalModel: this,
        action: 'deactivate'
      });
    },
  },

  delete(/*arguments*/) {
    var promise = this._super.apply(this, arguments);
    return promise.then(() => {
      if (get(this,'active')) {
        window.location.href = window.location.href;
      }
    }).catch((err) => {
      get(this,'growl').fromError('Error deleting', err);
    });
  },

  icon: computed('active', function () {
    if (get(this,'active')) {
      return 'icon icon-folder-open';
    }
    else {
      return 'icon icon-folder text-muted';
    }
  }),

  isDefault: computed(`prefs.${C.PREFS.PROJECT_DEFAULT}`, 'id', function () {
    return get(this,`prefs.${C.PREFS.PROJECT_DEFAULT}`) === get(this,'id');
  }),

  active: computed('scope.currentProject.id', 'id', function () {
    return get(this, 'scope.currentProject.id') === get(this, 'id');
  }),

  canSetDefault: computed('combinedState', 'isDefault', function () {
    return get(this,'combinedState') === 'active' && !get(this,'isDefault');
  }),
});
