import Ember from 'ember';

export default Ember.Route.extend({
  webhookStore: Ember.inject.service(),

  model: function() {
    return Ember.RSVP.hash({
      receivers: this.get('webhookStore').findAll('webhookreceiver', {url: 'receivers', forceReload: true}),
    });
  },
});
