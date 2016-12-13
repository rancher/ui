import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  access: Ember.inject.service(),
  session          : Ember.inject.service(),
  language: Ember.inject.service('user-language'),
  cookies: Ember.inject.service(),

  beforeModel(transition) {
    this._super.apply(this,arguments);

    let lang = C.LANGUAGE.DEFAULT;
    const session       = this.get('session');
    const fromSession     = session.get(C.SESSION.LANGUAGE); // get local language
    const fromCookie = this.get('cookies').get(C.COOKIE.LANG);
    if (fromSession) {
      lang = fromSession;
    } else if(fromCookie){
      lang = fromCookie;
    }

    return this.get('language').sideLoadLanguage(lang).then(() => {
      if ( !this.get('access.enabled') && !transition.queryParams.shibbolethTest)
      {
        this.transitionTo('authenticated');
      }
    });
  },
});
