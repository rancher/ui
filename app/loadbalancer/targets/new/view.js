import Overlay from 'ui/overlay/view';
import { addAction } from 'ui/utils/add-view-action';

export default Overlay.extend({
  actions: {
    addTargetContainer: addAction('addTargetContainer', '.lb-target'),
    addTargetIp: addAction('addTargetIp', '.lb-target'),
  }
});
