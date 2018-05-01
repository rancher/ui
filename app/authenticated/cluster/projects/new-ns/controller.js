import Controller from '@ember/controller'
import NewOrEdit from 'ui/mixins/new-or-edit';
import { alias } from '@ember/object/computed';
import { computed, get/* , set */ } from '@ember/object';
import { inject as service } from '@ember/service';
import C from 'ui/utils/constants';

export default Controller.extend(NewOrEdit, {

  scope:           service(),

  primaryResource: alias('model.namespace'),
  queryParams:     ['addTo', 'from'],
  addTo:           null,
  from:            null,

  actions: {
    cancel() {
      let backTo = get(this, 'session').get(C.SESSION.BACK_TO)

      if (backTo) {
        window.location.href = backTo;
      } else {
        this.transitionToRoute('authenticated.cluster.projects.index');
      }
    },
  },

  doneSaving() {
    this.send('cancel');
  },

  allProjects: computed('model.allProjects', 'scope.currentCluster.id', function() {
    return get(this, 'model.allProjects').filterBy('clusterId', get(this,'scope.currentCluster.id'))
  }),

  nameExists: computed('primaryResource.name', 'model.namespaces.@each.name', function () {
    return get(this, 'primaryResource.name') && get(this, 'model.namespaces').findBy('name', get(this, 'primaryResource.name'));
  }),
});
