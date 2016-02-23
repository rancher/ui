import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  k8s: Ember.inject.service(),
  'tab-session': Ember.inject.service('tab-session'),

  model(params) {
    return this.get('k8s').getNamespace(params.namespace_id).then((ns) => {
      this.set(`tab-session.${C.TABSESSION.NAMESPACE}`, ns.get('id'));
      this.set('k8s.namespace', ns);
      return ns;
    }).catch((/*err*/) => {
      this.set('k8s.namespace', null);
      this.transitionTo('k8s-tab');
    });
  },
});
