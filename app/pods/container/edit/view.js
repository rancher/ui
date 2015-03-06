import Overlay from "ui/pods/overlay/view";

export default Overlay.extend({
  templateName: 'container/edit',

  actions: {
    overlayClose: function() {
      this.get('controller').send('cancel');
    },

    overlayEnter: function() {
      this.get('controller').send('save');
    },
  }
});
