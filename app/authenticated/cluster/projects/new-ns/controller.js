import Controller from '@ember/controller'
import NewOrEdit from 'ui/mixins/new-or-edit';
import { alias } from '@ember/object/computed';
import { computed, get/* , set */ } from '@ember/object';
import { inject as service } from '@ember/service';
import C from 'ui/utils/constants';

export default Controller.extend(NewOrEdit, {

  scope:           service(),

  queryParams:     ['addTo', 'from'],
  addTo:           null,
  from:            null,

  primaryResource: alias('model.namespace'),
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

});
