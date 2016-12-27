import Ember from 'ember';

export default Ember.Route.extend({
  webhookStore: Ember.inject.service(),
  allServices: Ember.inject.service(),

  model(params) {
    return this.get('webhookStore').find('receiver', params.receiver_id).then((receiver) => {
      return Ember.Object.create({
        receiver: receiver,
        allServices: this.get('allServices').choices(),
      });
    });
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('errors', null);
    }
  }
});
