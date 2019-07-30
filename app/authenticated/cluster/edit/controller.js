import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({
  settings: service(),

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
