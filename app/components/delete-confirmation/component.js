import Ember from 'ember';
import { alternateLabel } from 'ui/utils/platform';

export default Ember.Component.extend({
  resources: null,
  alternateLabel: alternateLabel,

  actions: {
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

  didRender: function() {
    setTimeout(() => {
      this.$('BUTTON')[0].focus();
    }, 500);
  }
});
