import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate: function() {
    this.render('confirmDelete', {
      into: 'application',
      outlet: 'overlay',
      controller: 'volume'
    });
  },

  actions: {
    confirm: function() {
      this.controllerFor('volume').send('delete');
      this.transitionTo('volumes');
    },

    cancel: function() {
      this.transitionTo('volumes');
    }
  }
});
