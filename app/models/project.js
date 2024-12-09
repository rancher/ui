import { get, set, computed, observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';
import { hasMany, reference } from 'ember-api-store/utils/denormalize';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import { alias } from '@ember/object/computed';

const SYSTEM_PROJECT_LABEL = 'authz.management.cattle.io/system-project';

export default Resource.extend({
  access:                      service(),
  prefs:                       service(),
  scope:                       service(),
  settings:                    service(),
  modalService:                service('modal'),
  router:                      service(),
  clusterStore: service(),

  projectRoleTemplateBindings: hasMany('id', 'projectRoleTemplateBinding', 'projectId'),
  apps:                        hasMany('id', 'apps', 'projectId'),

  namespaces: hasMany('id', 'namespace', 'projectId', 'clusterStore'),

  type:              'project',
  name:              null,
  description:       null,
  isMonitoringReady: false,

  cluster:                     reference('clusterId', 'cluster'),
  // 2.0 bug projectId is wrong in the ptrb should be <cluster-id>:<project-id> instead of just <project-id>
  roleTemplateBindings:        alias('projectRoleTemplateBindings'),
  icon:                 computed('active', function() {
    if (this.active) {
      return 'icon icon-folder-open';
    } else {
      return 'icon icon-folder text-muted';
    }
  }),

  isDefault: computed(`prefs.${ C.PREFS.PROJECT_DEFAULT }`, 'id', function() {
    return get(this, `prefs.${ C.PREFS.PROJECT_DEFAULT }`) === this.id;
  }),

  isSystemProject: computed('labels', function() {
    const labels = this.labels || {};

    return labels[SYSTEM_PROJECT_LABEL] === 'true';
  }),

  conditionsDidChange: on('init', observer('enableProjectMonitoring', 'conditions.@each.status', function() {
    if ( !this.enableProjectMonitoring ) {
      return false;
    }
    const conditions = this.conditions || [];

    const ready = conditions.findBy('type', 'MonitoringEnabled');

    const status = ready && get(ready, 'status') === 'True';

    if ( status !== this.isMonitoringReady ) {
      set(this, 'isMonitoringReady', status);
    }
  })),

  active: computed('scope.currentProject.id', 'id', function() {
    return get(this, 'scope.currentProject.id') === this.id;
  }),

  canSaveMonitor: computed('actionLinks.{editMonitoring,enableMonitoring}', 'enableProjectMonitoring', 'isSystemProject', function() {
    if ( this.isSystemProject ) {
      return false;
    }
    const action = this.enableProjectMonitoring ?  'editMonitoring' : 'enableMonitoring';

    return !!this.hasAction(action)
  }),

  canDisableMonitor: computed('actionLinks.disableMonitoring', function() {
    return !!this.hasAction('disableMonitoring')
  }),

  canSetDefault: computed('combinedState', 'isDefault', function() {
    return this.combinedState === 'active' && !this.isDefault;
  }),

  isReady: computed('relevantState', 'cluster.isReady', function() {
    return this.relevantState === 'active' && get(this, 'cluster.isReady');
  }),

  actions: {
    edit() {
      this.router.transitionTo('authenticated.cluster.projects.edit', this.id);
    },

    activate() {
      return this.doAction('activate');
    },

    deactivate() {
      return this.doAction('deactivate').then(() => {
        if ( get(this, 'scope.currentProject') === this ) {
          window.location.href = window.location.href; // eslint-disable-line no-self-assign
        }
      });
    },

    setAsDefault() {
      set(this.prefs, C.PREFS.PROJECT_DEFAULT, this.id);
    },

    promptStop() {
      this.modalService.toggleModal('modal-confirm-deactivate', {
        originalModel: this,
        action:        'deactivate'
      });
    },
  },

  delete(/* arguments*/) {
    var promise = this._super.apply(this, arguments);

    return promise.then(() => {
      if (this.active) {
        window.location.href = window.location.href; // eslint-disable-line no-self-assign
      }
    }).catch((err) => {
      this.growl.fromError('Error deleting', err);
    });
  },

});
