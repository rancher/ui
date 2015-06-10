import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').find('setting',null,{filter: {all: 'false'}});
  },

  renderTemplate: function() {
    this.render({into: 'application', outlet: 'overlay'});
  },

  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  }
});
