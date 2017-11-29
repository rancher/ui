import { notEmpty, equal } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { hasMany } from 'ember-api-store/utils/denormalize';
import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';
import { reference } from 'ember-api-store/utils/denormalize';

var Project = Resource.extend(PolledResource, {
  access: service(),
  prefs: service(),
  scope: service(),
  settings: service(),
  modalService: service('modal'),
  router: service(),
  cookies: service(),
  clusterStore: service('cluster-store'),

  type: 'project',
  name: null,
  description: null,

  cluster: reference('clusterId', 'cluster', 'clusterStore'),
  clusterId: 'mycluster', // @TODO-2.0

  canAddHost: notEmpty('cluster.registrationToken.hostCommand'),
  canImport: notEmpty('cluster.registrationToken.clusterCommand'),
  isKubernetes: equal('cluster.orchestration', 'kubernetes'),
  projectRoleTemplateBindings: hasMany('id', 'projectRoleTemplateBinding', 'projectId'),

  actions: {
    edit: function () {
      this.get('router').transitionTo('authenticated.clusters.cluster.projects.edit', this.get('id'));
    },

    activate: function () {
      return this.doAction('activate').then(() => {
        return this.waitForState('active').then(() => {
          this.get('scope').refreshAll();
        });
      });
    },

    deactivate: function () {
      return this.doAction('deactivate').then(() => {
        if (this.get('active')) {
          window.location.href = window.location.href;
        }
      });
    },

    setAsDefault: function () {
      this.get('prefs').set(C.PREFS.PROJECT_DEFAULT, this.get('id'));
    },

    switchTo: function () {
      // @TODO bad
      window.lc('authenticated').send('switchProject', this.get('id'));
    },

    promptStop: function () {
      this.get('modalService').toggleModal('modal-confirm-deactivate', {
        originalModel: this,
        action: 'deactivate'
      });
    },

  },

  availableActions: computed('actionLinks.{activate,deactivate}', 'links.{update,remove}', 'state', 'canSetDefault', function () {
    let a = this.get('actionLinks');
    let l = this.get('links');

    var choices = [
      { label: 'action.edit', icon: 'icon icon-edit', action: 'edit', enabled: true },
      { divider: true },
      { label: 'action.remove', icon: 'icon icon-trash', action: 'promptDelete', enabled: true, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi', icon: 'icon icon-external-link', action: 'goToApi', enabled: true },
    ];

    return choices;
  }),

  delete: function (/*arguments*/) {
    var promise = this._super.apply(this, arguments);
    return promise.then(() => {
      this.set('state', 'removed');
      if (this.get('active')) {
        window.location.href = window.location.href;
      }
    }).catch((err) => {
      this.get('growl').fromError('Error deleting', err);
    });
  },

  icon: computed('active', function () {
    if (this.get('active')) {
      return 'icon icon-folder-open';
    }
    else {
      return 'icon icon-folder text-muted';
    }
  }),

  isDefault: computed(`prefs.${C.PREFS.PROJECT_DEFAULT}`, 'id', function () {
    return this.get(`prefs.${C.PREFS.PROJECT_DEFAULT}`) === this.get('id');
  }),

  active: computed(`cookies.${C.COOKIE.PROJECT}`, 'id', function () {
    return (this.get('id') === this.get('cookies').get(C.COOKIE.PROJECT));
  }),

  canSetDefault: computed('state', 'isDefault', function () {
    return this.get('state') === 'active' && !this.get('isDefault');
  }),

  displayOrchestration: computed('orchestration', function () {
    return Util.ucFirst(this.get('orchestration'));
  }),

  isWindows: equal('orchestration', 'windows'),

  // @TODO real data
  numStacks: computed(function () {
    return 3 + Math.round(Math.random() * 3);
  }).volatile(),

  numServices: computed(function () {
    return 10 + Math.round(Math.random() * 9);
  }).volatile(),

  numContainers: computed(function () {
    return 50 + Math.round(Math.random() * 49);
  }).volatile(),
});

// Projects don't get pushed by /subscribe WS, so refresh more often
Project.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Project;
