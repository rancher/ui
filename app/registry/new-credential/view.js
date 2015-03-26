import Overlay from "ui/overlay/view";
import Ember from 'ember';

export default Overlay.extend({
  actions: {
    addCredential: function() {
      this.get('controller').send('addCredential');
      Ember.run.next(this, function() {
        this.$('.email').last().focus();
      });
    },

    overlayClose: function() {
      this.get('controller').send('cancel');
    },

    overlayEnter: function() {
      this.get('controller').send('save');
    },
  }
});
