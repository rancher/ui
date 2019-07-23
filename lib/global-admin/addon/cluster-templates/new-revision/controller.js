import Controller from '@ember/controller';
import { set } from '@ember/object';

export default Controller.extend({
  queryParams: ['revision'],

  revision:    null,

  parentRoute: 'global-admin.cluster-templates.index',

  actions: {
    cancel() {
      this.send('goToPrevious', this.parentRoute);
    },
    done() {
      this.transitionToRoute('cluster-templates.index');
    },
    updateTemplateId(template) {
      set(this, 'revision', template.id);
    },
  }
});
