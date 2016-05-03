import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  access: Ember.inject.service(),
  session          : Ember.inject.service(),
  language: Ember.inject.service('user-language'),

  beforeModel() {
    this._super.apply(this,arguments);

    let lang = C.LANGUAGE.DEFAULT;
    const session       = this.get('session');
    const fromLogin     = session.get(C.SESSION.LANGUAGE); // get local language

    if (fromLogin) {
      lang = fromLogin;
    }

    session.set(C.SESSION.LOGIN_LANGUAGE, lang);

    return this.get('language').sideLoadLanguage(lang).then(() => {
      if ( !this.get('access.enabled') )
      {
        this.transitionTo('authenticated');
      }
    });
  },
});
