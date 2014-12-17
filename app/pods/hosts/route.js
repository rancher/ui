import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('host');
  },

  renderTemplate: function() {
    this._super();
    this.render('hosts', {into: 'application'});
  },

  actions: {
    newContainer: function() {
      this.transitionTo('newContainer');
    },
  },
});
