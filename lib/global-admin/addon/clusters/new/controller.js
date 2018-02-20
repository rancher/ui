import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  cluster: alias('model.cluster'),

  provider: 'googlegke',
  queryParams: ['provider'],

  actions: {
    close() {
      this.send('goToPrevious', 'global-admin.clusters.index');
    },
  },
});
