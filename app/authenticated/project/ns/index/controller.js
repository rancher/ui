import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import C from 'ui/utils/constants';

export default Controller.extend({

  scope:   service(),
  router:  service(),
  session: service(),

  actions: {
    newNs() {
      get(this,'session').set(C.SESSION.BACK_TO, window.location.href);
      get(this, 'router').transitionTo('authenticated.cluster.projects.new-ns', get(this, 'scope.currentCluster.id'), { queryParams: { addTo: get(this, 'scope.currentProject.id') } } );
    },
  },

  allNamespace: computed('model.namespaces', function() {
    let ns = get(this, 'model.namespaces');
    let pId = get(this, 'scope.currentProject.id');

    return ns.filter( n => {
      return get(n, 'projectId') === pId || isEmpty(get(n, 'projectId'));
    });
  }),

});
