import Ember from 'ember';
import { alternateLabel } from 'ui/utils/platform';

export default Ember.Component.extend({
  resources: null,
  alternateLabel: alternateLabel,
  settings: Ember.inject.service(),

  actions: {
    outsideClick: function() {},

    confirm: function() {
      this.get('resources').forEach((resource) => {
        resource.delete();
      });

      this.sendAction('dismiss');
    },

    cancel: function() {
      this.sendAction('dismiss');
    },
  },

  isEnvironment: Ember.computed('resources', function() {
    let resources = this.get('resources');
    let out = false;

    resources.forEach((resource) => {
      if (resource.type === 'project') {
        out = true;
      }
    });

    return out;
  }),

  didRender: function() {
    setTimeout(() => {
      this.$('BUTTON')[0].focus();
    }, 500);
  }
});
