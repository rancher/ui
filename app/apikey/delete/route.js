import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate: function() {
    this.render('confirmDelete', {into: 'application', outlet: 'overlay', controller: 'apikey'});
  },

  actions: {
    confirm: function() {
      var self = this;
      var controller = this.controllerFor('apikey');
      controller.delete().then(function() {
        self.transitionTo('apikeys');
      }).catch(function(err) {
        controller.send('error',err);
      });
    },

    cancel: function() {
      this.transitionTo('apikeys');
    }
  }
});
