import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  access: Ember.inject.service(),
  session          : Ember.inject.service(),
  language: Ember.inject.service('user-language'),

  beforeModel() {
    this._super.apply(this,arguments);

    const session       = this.get('session');
    const language      = this.get('language');
    const uplLocal      = this.get('session').get(C.SESSION.LANGUAGE); // get local language
    let defaultLanguage = C.LANGUAGE.DEFAULT;

    if (uplLocal) {
      defaultLanguage = uplLocal;
    }

    language.sideLoadLanguage(defaultLanguage);

    session.set(C.SESSION.LOGIN_LANGUAGE, defaultLanguage);

    if ( !this.get('access.enabled') )
    {
      this.transitionTo('authenticated');
    }
  },
});
