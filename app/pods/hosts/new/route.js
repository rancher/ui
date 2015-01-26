import OverlayRoute from 'ui/pods/overlay/route';

export default OverlayRoute.extend({
  actions: {
    cancel: function() {
      this.send('goToPrevious');
    }
  },

  model: function() {
    var self = this;
    return self.get('store').find('registrationToken').then(function(tokens) {
      if ( tokens.get('length') === 0 )
      {
        // There should always be one already, but if there isn't go create one...
        return self.get('store').createRecord({
          type: 'registrationToken'
        }).save();
      }
      else
      {
        return tokens.get('firstObject');
      }
    });
  },

  renderTemplate: function() {
    this.render('hosts/new', {into: 'application', outlet: 'overlay'});
  },
});
