import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  queryParams: ['provider'],

  provider: 'googlegke',
  cluster:  alias('model.cluster'),

  actions: {
    close() {
      this.transitionToRoute('clusters.index');
    },
  },
});
