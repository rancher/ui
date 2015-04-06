import Ember from 'ember';
import OverlayRoute from 'ui/overlay/route';

export default OverlayRoute.extend({
  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  },

  model: function() {
    var model = this.modelFor('container');
    return Ember.RSVP.all([
      model.importLink('ports'),
      model.importLink('instanceLinks')
    ]).then(function() {
      return model;
    });
  },

  setupController: function(controller, model) {
    controller.set('originalModel',model);
    controller.set('model', model.clone());
    controller.initFields();
  },

  renderTemplate: function() {
    this.render('container/edit', {into: 'application', outlet: 'overlay'});
  },
});
