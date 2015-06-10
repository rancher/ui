import Overlay from "ui/overlay/view";
import SelectTab from 'ui/mixins/select-tab';
import { addAction } from 'ui/utils/add-view-action';

export default Overlay.extend(SelectTab, {
  actions: {
    addListener: addAction('addListener', '.lb-listener-source-port'),

    overlayClose: function() {
      this.get('controller').send('cancel');
    },

    overlayEnter: function() {
      this.get('controller').send('save');
    },
  },

  didInsertElement: function() {
    this.send('selectTab',this.get('context.tab'));
  },

});
