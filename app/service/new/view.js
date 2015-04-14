import NewContainerView from 'ui/containers/new/view';
import { addAction } from 'ui/containers/new/view';

export default NewContainerView.extend({
  actions: {
    addVolumeFromService:  addAction('addVolumeFromService',  '.volumefromservice-container'),
    addServiceLink:        addAction('addServiceLink',  '.service-link'),
  },
});
