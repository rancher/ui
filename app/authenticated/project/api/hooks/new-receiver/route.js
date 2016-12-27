import Ember from 'ember';

export default Ember.Route.extend({
  webhookStore: Ember.inject.service(),
  allServices: Ember.inject.service(),

  model(params) {
    let promise;
    if ( params.receiverId ) {
      promise = this.get('webhookStore').find('receiver', params.receiverId);
    } else {
      promise = Ember.RSVP.resolve(this.get('webhookStore').createRecord({
        type: 'receiver',
        driver: 'scaleService',
        scaleServiceConfig: {
          type: 'scaleService',
          action: 'up',
          amount: 1,
          serviceId: null,
        }
      }));
    }

    return promise.then((receiver) => {
      return Ember.Object.create({
        receiver: receiver.cloneForNew(),
        allServices: this.get('allServices').choices(),
      });
    });
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('errors', null);
      controller.set('receiverId', null);
    }
  }
});
