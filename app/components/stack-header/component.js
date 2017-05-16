import Ember from 'ember';

export default Ember.Component.extend({
  settings: Ember.inject.service(),
  projects: Ember.inject.service(),
  hasVm: Ember.computed.alias('projects.current.virtualMachine'),

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
