import OverlayRoute from 'ui/pods/overlay/route';

export default OverlayRoute.extend({
  actions: {
    cancel: function() {
      // @TODO don't remember switches between tabs as previous routes
      //this.send('goToPrevious');
      this.transitionTo('hosts');
    }
  },

  renderTemplate: function() {
    this.render('hosts/new', {into: 'application', outlet: 'overlay'});
  },
});
