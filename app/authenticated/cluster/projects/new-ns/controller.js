import Controller from '@ember/controller'
import NewOrEdit from 'ui/mixins/new-or-edit';
import { alias } from '@ember/object/computed';
import { computed, get, set, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import C from 'ui/utils/constants';

const ISTIO_INJECTION = 'istio-injection'
const ENABLED = 'enabled';

export default Controller.extend(NewOrEdit, {
  scope: service(),

  queryParams:     ['addTo', 'from'],
  addTo:           null,
  from:            null,
  istioInjection:  false,

  primaryResource: alias('model.namespace'),
  actions:         {
    cancel() {
      let backTo = get(this, 'session').get(C.SESSION.BACK_TO)

      if (backTo) {
        this.transitionToRoute('authenticated.project.ns.index', get(this, 'addTo'));
      } else {
        this.transitionToRoute('authenticated.cluster.projects.index');
      }
    },

    updateNsQuota(quota) {
      if ( quota ) {
        set(this, 'primaryResource.resourceQuota', { limit: quota });
      } else {
        set(this, 'primaryResource.resourceQuota', null);
      }
    },

    updateContainerDefault(limit) {
      set(this, 'primaryResource.containerDefaultResourceLimit', limit);
    },

    toggleAutoInject() {
      set(this, 'istioInjection', !get(this, 'istioInjection'));
    },

    setLabels(labels) {
      let out = {};

      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      set(this, 'primaryResource.labels', out);
    },
  },

  projectDidChange: observer('primaryResource.project.id', function() {
    set(this, 'switchingProject', true);
    next(() => {
      set(this, 'switchingProject', false);
    });
    if ( !get(this, 'primaryResource.project.resourceQuota') ) {
      set(this, 'primaryResource.resourceQuota', null);
    }
  }),


  allProjects:     computed('model.allProjects', 'scope.currentCluster.id', function() {
    return get(this, 'model.allProjects').filterBy('clusterId', get(this, 'scope.currentCluster.id'))
  }),

  projectLimit: computed('primaryResource.resourceQuota.{limit}', 'primaryResource.projectId', function() {
    const projectId = get(this, 'primaryResource.projectId');
    const project   = get(this, 'allProjects').findBy('id', projectId);

    return get(project, 'resourceQuota.limit');
  }),

  projectUsedLimit: computed('primaryResource.resourceQuota.{limit}', 'primaryResource.projectId', function() {
    const projectId = get(this, 'primaryResource.projectId');
    const project   = get(this, 'allProjects').findBy('id', projectId);

    return get(project, 'resourceQuota.usedLimit');
  }),

  nsDefaultQuota: computed('primaryResource.resourceQuota.{limit}', 'primaryResource.projectId', function() {
    const projectId = get(this, 'primaryResource.projectId');
    const project   = get(this, 'allProjects').findBy('id', projectId);

    return get(project, 'namespaceDefaultResourceQuota.limit');
  }),

  nameExists: computed('primaryResource.name', 'model.namespaces.@each.name', function() {
    const name = get(this, 'primaryResource.name');

    if ( name ) {
      const found = get(this, 'model.namespaces').findBy('name', name);

      return found && get(this, 'primaryResource.id') !== get(found, 'id');
    }

    return false;
  }),

  willSave() {
    const isEnabled = get(this, 'istioInjection');
    const labels = { ...get(this, 'primaryResource.labels') };

    if ( isEnabled ) {
      labels[ISTIO_INJECTION] = ENABLED;
    }

    set(this, 'primaryResource.labels', labels);

    return this._super(...arguments);
  },

  validate() {
    this._super();

    const errors = get(this, 'errors') || [];
    const quotaErrors = get(this, 'primaryResource').validateResourceQuota();

    if ( quotaErrors.length > 0 ) {
      errors.pushObjects(quotaErrors);
    }

    set(this, 'errors', errors);

    return get(this, 'errors.length') === 0;
  },

  doneSaving() {
    this.send('cancel');
  },

});
