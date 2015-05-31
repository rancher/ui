import Overlay from 'ui/overlay/view';
import { addAction } from 'ui/utils/add-view-action';

export default Overlay.extend({
  actions: {
    addHost: addAction('addHost', '.lb-host'),
  }
});
