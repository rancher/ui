import Overlay from 'ui/overlay/view';

export default Overlay.extend({
  actions: {
    overlayEnter: function() {
      this.get('controller').send('save');
    },

    overlayClose: function() {
      this.get('controller').send('cancel');
    },
  },
});
