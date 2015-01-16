import Overlay from 'ui/pods/overlay/view';

export default Overlay.extend({
  templateName: 'confirm-delete',
  classNames: ['overlay-small'],

  actions: {
    overlayClose: function() {
      this.get('controller').send('cancel');
    },

    overlayEnter: function() {
      this.get('controller').send('confirm');
    }
  }
});
