import { inject as service } from '@ember/service';
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
    this._super.apply(this,arguments);
    return this.get('language').initUnauthed();
  },

  setupController(controller/*, model*/) {
    this._super(...arguments);
    set(controller,'changePassword', flase);
  }
});
