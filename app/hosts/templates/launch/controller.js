import Ember from 'ember';

export default Ember.Controller.extend({
  hostTemplate: Ember.computed.alias('model.template'),
  machineConfig: Ember.computed.alias('model.config'),
  actions: {
    save() {
      debugger;
    },
    cancel() {
      this.transitionToRoute('hosts.templates.index');
    },
  }
});
