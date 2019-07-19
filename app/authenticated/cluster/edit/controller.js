import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  queryParams:             ['provider', 'clusterTemplateRevision'],
  provider:                null,
  clusterTemplateRevision: null,

  cluster: alias('model.cluster'),

  actions: {
    close() {
      this.transitionToRoute('authenticated.cluster');
    },
  },
});
