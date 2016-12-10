import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  k8s: Ember.inject.service(),

  model() {
    return this.get('k8s').getServices().then((services) => {
      let svc = services.find(function(x) {
        return x && x.metadata && x.metadata.labels && x.metadata.labels[C.LABEL.K8S_DASHBOARD];
      });

      if ( svc )
      {
        let port = svc.spec.ports[0];
        let dashboard;
        if ( port ) {
          dashboard = 'http://' + this.get('k8s.clusterIp') +'/'+ port.nodePort;
        }

        return Ember.Object.create({
          dashboardUrl: dashboard,
        });
      }
      else
      {
        return Ember.RSVP.reject('Unable to find kubernetes-dashbaord service');
      }
    });
  },
});
