import Overlay from 'ui/pods/overlay/view';

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
