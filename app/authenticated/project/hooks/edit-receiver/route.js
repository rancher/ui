import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  webhookStore: service(),

  model(params) {
    return this.get('webhookStore').find('receiver', params.receiver_id).then((receiver) => {
      return EmberObject.create({
        receiver: receiver,
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
