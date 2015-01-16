import OverlayRoute from 'ui/pods/overlay/route';

export default OverlayRoute.extend({
  renderTemplate: function() {
    this.render('confirmDelete', {
      into: 'application',
      outlet: 'overlay',
      controller: 'container'
    });
  },

  actions: {
    confirm: function() {
      this.controllerFor('container').send('delete');
      this.send('goToPrevious');
    },

    cancel: function() {
      this.send('goToPrevious');
    }
  }
});
