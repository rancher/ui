import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  scope:  service(),
  router: service(),

  currentRouteName: alias('router.currentRouteName'),
});
