import Ember from 'ember';

export default Ember.Route.extend({
  webhookStore: Ember.inject.service(),

  model: function() {
    return this.get('webhookStore').findAll('schema', {url: 'schemas'}).then((schemas) => {
      let receiver = schemas.findBy('id','receiver').resourceFields;
      receiver.name.required = true;
      receiver.scaleServiceConfig.required = true;
      schemas.findBy('id','scaleservice').resourceFields.serviceId.required = true;

      return Ember.RSVP.hash({
        receivers: this.get('webhookStore').findAll('receiver', {forceReload: true}),
      });
    });
  },
});
