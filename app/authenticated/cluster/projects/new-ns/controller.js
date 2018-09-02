import Controller from '@ember/controller'
import NewOrEdit from 'ui/mixins/new-or-edit';
import { alias } from '@ember/object/computed';
import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import C from 'ui/utils/constants';

export default Controller.extend(NewOrEdit, {
  scope: service(),

  queryParams:     ['addTo', 'from'],
  addTo:           null,
  from:            null,

  primaryResource: alias('model.namespace'),
  actions:         {
    cancel() {
      let backTo = get(this, 'session').get(C.SESSION.BACK_TO)

      if (backTo) {
        window.location.href = backTo;
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
  },

  allProjects:     computed('model.allProjects', 'scope.currentCluster.id', function() {
    return get(this, 'model.allProjects').filterBy('clusterId', get(this, 'scope.currentCluster.id'))
  }),

  nameExists: computed('primaryResource.name', 'model.namespaces.@each.name', function() {
    const name = get(this, 'primaryResource.name');

    if ( name ) {
      const found = get(this, 'model.namespaces').findBy('name', name);

      return found && get(this, 'primaryResource.id') !== get(found, 'id');
    }

    return false;
  }),

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
