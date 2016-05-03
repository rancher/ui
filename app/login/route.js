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

    session.set(C.SESSION.LOGIN_LANGUAGE, defaultLanguage);

    return language.sideLoadLanguage(defaultLanguage).then(() => {;
      if ( !this.get('access.enabled') )
      {
        this.transitionTo('authenticated');
      }
    });
  },
});
