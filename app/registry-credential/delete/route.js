import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate: function() {
    this.render('confirmDelete', {into: 'application', outlet: 'overlay', controller: 'registryCredential'});
  },

  actions: {
    confirm: function() {
      var self = this;
      var controller = this.controllerFor('registryCredential');
      controller.delete().then(function() {
        self.transitionTo('registry');
      }).catch(function(err) {
        controller.send('error',err);
      });
    },

    cancel: function() {
      this.transitionTo('registry');
    }
  }
});
