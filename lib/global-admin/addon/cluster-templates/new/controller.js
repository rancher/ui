import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  router: service(),

  parentRoute: 'global-admin.cluster-templates.index',

  actions: {
    cancel() {
      this.send('goToPrevious', this.parentRoute);
    },
    done() {
      this.transitionToRoute('cluster-templates.index');
    }
  }
});
