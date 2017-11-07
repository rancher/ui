import EmberObject from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { inject as service } from "@ember/service";
import layout from './template';

export default Component.extend({
  layout,
  settings: service(),
  projects: service(),
  hasVm: alias('projects.current.virtualMachine'),
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
      out.push(EmberObject.create({
        key: key,
        value: map[key],
      }));
    });

    return out;
  }.property('model.outputs','model.id'),
});
