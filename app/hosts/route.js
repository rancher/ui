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

  // NOTE: going to leave this in place because frankly I'm not sure why we did a redirect here
  // I can not seem to find any issues with not doing this redirect but if something pops up
  // maybe this will be a bread crumb for the poor person who has to fix it ~ <3 wjw
  // redirect: function(model, transition) {
  //   let mode = this.get(`prefs.${C.PREFS.HOST_VIEW}`)||'list';

  //   if (!this.isContinerCloud(transition)) {
  //     this.transitionTo('hosts.index', {queryParams: {
  //       mode: mode,
  //     }});
  //   }
  // },
  // isContinerCloud: function(trans) {
  //   if (trans.targetName === 'hosts.container-cloud.index' || trans.targetName === 'hosts.container-cloud.add') {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }
});
