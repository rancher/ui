import Ember from 'ember';

export default Ember.Route.extend({
  webhookStore: Ember.inject.service(),

  model(params) {
    let promise;
    let store = this.get('webhookStore');
    if ( params.receiverId ) {
      promise = store.find('receiver', params.receiverId);
    } else {
      promise = Ember.RSVP.resolve(store.createRecord({
        type: 'receiver',
        driver: 'scaleService',
      }));
    }

    return promise.then((receiver) => {
      return Ember.Object.create({
        receiver: receiver.cloneForNew(),
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
