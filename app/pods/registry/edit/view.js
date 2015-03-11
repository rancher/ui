import Overlay from "ui/pods/overlay/view";

export default Overlay.extend({
  templateName: 'registries/new',

  actions: {
    overlayClose: function() {
      this.get('controller').send('cancel');
    },

    overlayEnter: function() {
      this.get('controller').send('save');
    },
  }
});
