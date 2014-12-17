import Overlay from './overlay';

export default Overlay.extend({
  actions: {
    overlayClose: function() {
      this.get('controller').send('cancel');
    },

    overlayEnter: function() {
      this.get('controller').send('save');
    },

    showAdvanced: function() {
      this.get('context').set('advanced',true);
    }
  },
});
