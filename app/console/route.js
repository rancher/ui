import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  projects: Ember.inject.service(),
  k8s: Ember.inject.service(),
  model: function(params) {
    let store = this.get('store');
    if (params.kubernetes) {
      return this.get('k8s').getInstanceToConnect();
    }

    return store.find('container', params.instanceId).then((response) => {
      return response;
    });
  },
  setupController(controller, model) {
    this._super(controller, model);
    if (controller.get('kubernetes')) {
      controller.set('command', Ember.computed('model.labels', function() {
        var labels = this.get('model.labels')||{};
        if ( labels[C.LABEL.K8S_TOKEN]+'' === 'true' ) {
          return [
            'kubectl-shell.sh',
            this.get('cookies').get(C.COOKIE.TOKEN) || 'unauthorized'
          ];
        } else {
          return ['/bin/bash','-l','-c','echo "# Run kubectl commands inside here\n# e.g. kubectl get rc\n"; TERM=xterm-256color /bin/bash'];
        }
      }));
    }
  }
});
