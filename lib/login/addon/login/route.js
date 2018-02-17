import { inject as service } from '@ember/service';
import { get, setProperties } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  access: service(),
  language: service('user-language'),

  activate() {
    $('BODY').addClass('container-farm');
  },

  deactivate() {
    $('BODY').removeClass('container-farm');
  },

  beforeModel() {
    this._super(...arguments);
    return get(this, 'language').initUnauthed();
  },

  setupController(controller, model) {
    setProperties(controller, model);
  }
});
