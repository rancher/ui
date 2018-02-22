import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  cluster: alias('model.cluster'),

  queryParams: ['provider'],
  provider: null,

  actions: {
    close() {
      this.transitionToRoute('authenticated.cluster');
    },
  },
});
