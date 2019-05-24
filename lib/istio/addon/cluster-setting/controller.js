import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { get } from '@ember/object'

export default Controller.extend({
  router:          service(),

  actions: {
    cancel() {
      get(this, 'router').transitionTo('authenticated.cluster');
    },
  },
});
