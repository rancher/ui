import C from 'ui/utils/constants';
import Ember from 'ember';

export default Ember.Route.extend({
  prefs: Ember.inject.service(),

  model: function() {
    var store = this.get('store');
    return Ember.RSVP.hash({
      hosts: store.findAll('host'),
      instances: store.findAll('instance'),
    }).then((hash) => {
      return hash.hosts;
    });
  },

  redirect: function(model, transition) {
    let mode = this.get(`prefs.${C.PREFS.HOST_VIEW}`)||'list';

    if (transition.targetName !== 'hosts.container-cloud.index') {
      this.transitionTo('hosts.index', {queryParams: {
        mode: mode,
      }});
    }
  }
});
