import Overlay from "ui/overlay/view";

export default Overlay.extend({
  templateName: 'apikey/edit',

  actions: {
    overlayClose: function() {
      this.get('controller').send('cancel');
    },

    overlayEnter: function() {
      this.get('controller').send('save');
    },
  }
});
