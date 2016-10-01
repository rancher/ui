import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  projects: Ember.inject.service(),
  k8s: Ember.inject.service(),
  'tab-session': Ember.inject.service(),

  beforeModel() {
    this._super(...arguments);
    var auth = this.modelFor('authenticated');
    return this.get('projects').checkForWaiting(auth.get('hosts'));
  },

  model() {
    var k8s = this.get('k8s');
    return Ember.RSVP.hashSettled({
      namespaces: k8s.allNamespaces(),
      services: k8s.allServices(),
      rcs: k8s.allRCs(),
      pods: k8s.allPods(),
      deployments: k8s.allDeployments(),
      replicasets: k8s.allReplicaSets(),
      containers: this.get('store').findAll('container'),
    }).then((hash) => {
      let errors = [];
      let out = {};
      Object.keys(hash).forEach((key) => {
        if ( hash[key].state === 'rejected' ) {
          let err = hash[key].reason;
          err.key = key;
          errors.push(err);
        } else {
          out[key] = hash[key].value;
        }
      });

      if ( errors.length ) {
        this.set(`tab-session.${C.TABSESSION.NAMESPACE}`, null);
        k8s.set('namespace', null);
        k8s.set('loadingErrors', errors);
        this.transitionTo('k8s-tab.error');
      } else {
        return k8s.selectNamespace().then(() => {
          k8s.set('loadingErrors', null);
          k8s.setProperties(out);
        });
      }
    });
  },

  deactivate: function() {
    $('BODY').removeClass('k8s');
  },
});
