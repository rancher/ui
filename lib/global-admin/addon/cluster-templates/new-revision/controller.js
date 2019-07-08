import Controller from '@ember/controller';
import { set } from '@ember/object';

export default Controller.extend({
  queryParams: ['revision'],

  revision: null,

  actions: {
    updateTemplateId(template) {
      set(this, 'revision', template.id);
    },
  }
});
