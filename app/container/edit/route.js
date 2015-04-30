import Ember from 'ember';
import OverlayRoute from 'ui/overlay/route';

export default OverlayRoute.extend({
  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  },

  model: function() {
    var data = this.modelFor('container');
    var model = data.get('container');
    return Ember.RSVP.all([
      model.followLink('ports'),
      model.followLink('instanceLinks'),
      this.get('store').findAll('host'), // Need inactive ones in case a link points to an inactive host
    ]).then(function(results) {
      return Ember.Object.create({
        instance: model,
        ports: results[0],
        instanceLinks: results[1],
        allHosts: results[2],
      });
    });
  },

  setupController: function(controller, model) {
    var instance = model.get('instance');
    controller.set('originalModel', instance);
    model.set('instance', instance.clone());
    controller.set('model', model);
    controller.initFields();
  },

  renderTemplate: function() {
    this.render('container/edit', {into: 'application', outlet: 'overlay'});
  },
});
