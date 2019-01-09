import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  language: service('user-language'),

  beforeModel() {
    return this.get('language').initLanguage();
  },

  redirect() {
    let url = this._router.location.formatURL('/not-found');

    if (window.location.pathname !== url) {
      this.transitionTo('not-found');
    }
  }
});
