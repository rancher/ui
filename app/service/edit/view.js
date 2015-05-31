import Overlay from "ui/overlay/view";
import { addAction } from 'ui/utils/add-view-action';

export default Overlay.extend({
  actions: {
    addServiceLink:        addAction('addServiceLink',  '.service-link'),

    overlayClose: function() {
      this.get('controller').send('cancel');
    },

    overlayEnter: function() {
      this.get('controller').send('save');
    },
  }
});
