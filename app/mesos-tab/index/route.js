import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  mesos: Ember.inject.service(),
  'tab-session': Ember.inject.service('tab-session'),

  redirect() {
    var nsId = this.get(`tab-session.${C.TABSESSION.NAMESPACE}`);
    this.transitionTo('mesos-tab.waiting', nsId);
  },
});
