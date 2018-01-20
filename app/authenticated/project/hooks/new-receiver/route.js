import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  webhookStore: service(),
  store: service(),

  beforeModel() {
    this._super(...arguments);
    return this.get('store').findAll('machineTemplate').then((templates) => {
      this.controllerFor('authenticated.project.hooks.new-receiver').set('machineTemplates', templates);
    });
  },

  model(params) {
    let promise;
    let store = this.get('webhookStore');
    if ( params.receiverId ) {
      promise = store.find('receiver', params.receiverId);
    } else {
      promise = resolve(store.createRecord({
        type: 'receiver',
        driver: 'scaleService',
      }));
    }

    return promise.then((receiver) => {
      return EmberObject.create({
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
