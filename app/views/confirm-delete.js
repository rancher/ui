import Overlay from 'ui/pods/overlay/view';
import { alternateLabel } from 'ui/utils/platform';

export default Overlay.extend({
  templateName: 'confirm-delete',
  classNames: ['overlay-small'],

  alternateLabel: alternateLabel,

  actions: {
    overlayClose: function() {
      this.get('controller').send('cancel');
    },

    overlayEnter: function() {
      this.get('controller').send('confirm');
    }
  }
});
