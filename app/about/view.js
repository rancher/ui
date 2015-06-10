import Overlay from 'ui/overlay/view';
import { addAction } from 'ui/utils/add-view-action';

export default Overlay.extend({
  classNames: ['about'],
  actions: {
    overlayClose: function() {
      this.get('controller').send('cancel');
    },

    overlayEnter: function() {
      this.get('controller').send('save');
    },

    addLabel:       addAction('addLabel',      '.label-key'),
  }
});
