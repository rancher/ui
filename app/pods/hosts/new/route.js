import OverlayRoute from 'ui/pods/overlay/route';

export default OverlayRoute.extend({
  actions: {
    cancel: function() {
      this.send('goToPrevious');
    }
  },

  renderTemplate: function() {
    this.render('hosts/new', {into: 'application', outlet: 'overlay'});
  },
});
