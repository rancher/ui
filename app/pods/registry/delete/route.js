import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate: function() {
    this.render('confirmDelete', {into: 'application', outlet: 'overlay', controller: 'registry'});
  },

  actions: {
    confirm: function() {
      var self = this;
      var controller = this.controllerFor('registry');
      controller.delete().then(function() {
        self.transitionTo('registries');
      }).catch(function(err) {
        controller.send('error',err);
      });
    },

    cancel: function() {
      this.transitionTo('registries');
    }
  }
});
