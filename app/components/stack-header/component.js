import Ember from 'ember';
import { inject as service } from "@ember/service";

export default Ember.Component.extend({
  settings: service(),
  projects: service(),
  hasVm: Ember.computed.alias('projects.current.virtualMachine'),
  router: service(),

  actions: {
    changeStack(stack) {
      var app = this.get('application');
      app.transitionToRoute(app.get('currentRouteName'), stack.get('id'));
      this.sendAction('hideAddtlInfo');
    }
  },

  outputs: function() {
    var out = [];
    var map = this.get('model.outputs')||{};
    Object.keys(map).forEach((key) => {
      out.push(Ember.Object.create({
        key: key,
        value: map[key],
      }));
    });

    return out;
  }.property('model.outputs','model.id'),
});
