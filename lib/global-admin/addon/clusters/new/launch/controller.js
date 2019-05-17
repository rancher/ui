import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({
  growl:  service(),

  queryParams: ['clusterTemplateRevision'],

  clusterTemplateRevision: null,

  cluster:  alias('model.cluster'),

  actions: {
    close(/* saved */) {
      this.transitionToRoute('clusters.index');
      // if (saved) {
      // } else {
      //   this.transitionToRoute('clusters.new');
      // }
    },

    clusterDriverErrorAndTransition() {
      // this.transitionToRoute('globalAdmin.clusters.new');
      this.transitionToRoute('globalAdmin.clusters.index');

      this.growl.fromError('That provider is no longer active. Please choose a different cluster provider or reactivate the previous cluster provider.');
    }
  },
});
