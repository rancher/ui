import OverlayRoute from 'ui/overlay/route';
import Ember from 'ember';

export default OverlayRoute.extend({
  model: function() {
    var dependencies = [
      this.get('store').findAll('host'),
    ];

    return Ember.RSVP.all(dependencies, 'Load dependencies').then((results) => {
      this.set('_allHosts', results[0]);
      return this.modelFor('loadbalancer');
    });
  },

  _allHosts: null,

  setupController: function(controller, model) {
    controller.set('allHosts', this.get('_allHosts'));
    controller.set('model',model);
    controller.initFields();
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
