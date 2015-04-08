import Overlay from 'ui/overlay/view';
import { alternateLabel } from 'ui/utils/platform';

export default Overlay.extend({
  templateName: 'confirm-delete',
  classNames: ['overlay-small'],

  alternateLabel: alternateLabel,

  actions: {
    overlayClose: function() {
      this.get('controller').send('cancelDelete');
    },

    overlayEnter: function() {
      this.get('controller').send('confirmDelete');
    }
  }
});
