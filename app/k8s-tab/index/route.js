import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  k8s: Ember.inject.service(),
  'tab-session': Ember.inject.service('tab-session'),

  redirect() {
    var all = this.get('k8s.namespaces')||[];
    var nsId = this.get(`tab-session.${C.TABSESSION.NAMESPACE}`);

    if ( all.filterBy('id', nsId).get('length') > 0 )
    {
      this.transitionTo('k8s-tab.namespace', nsId);
    }
    else if ( all.get('length') )
    {
      this.transitionTo('k8s-tab.namespace', all.objectAt(0).get('id'));
    }
  },
});
