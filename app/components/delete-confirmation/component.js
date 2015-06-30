import Ember from 'ember';
import { alternateLabel } from 'ui/utils/platform';

export default Ember.Component.extend({
  confirmDeleteResources: null,
  alternateLabel: alternateLabel,

  actions: {
    confirm: function() {
      this.get('confirmDeleteResources').forEach((resource) => {
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
