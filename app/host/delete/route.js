import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate: function() {
    this.render('confirmDelete', {into: 'application', outlet: 'overlay', controller: 'host'});
  },

  actions: {
    confirm: function() {
      this.controllerFor('host').send('delete');
      this.transitionTo('hosts');
    },

    cancel: function() {
      this.transitionTo('hosts');
    }
  }
});
