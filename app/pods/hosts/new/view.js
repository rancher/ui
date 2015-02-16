import OverlayView from 'ui/pods/overlay/view';

export default OverlayView.extend({
  actions: {
    overlayClose: function() {
      this.get('controller').send('cancel');
    },
  }
});
