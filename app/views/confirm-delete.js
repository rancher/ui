import Overlay from 'ui/views/overlay';

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
