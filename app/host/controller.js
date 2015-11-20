import Ember from 'ember';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  host: Ember.computed.alias('model.host'),

  actions: {
    changeHost(host) {
      this.get('application').transitionToRoute('host', host.get('id'));
    },
  }
});
