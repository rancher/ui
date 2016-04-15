import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  tagName      : 'div',
  classNames   : ['dropdown', 'language-dropdown', 'inline-block'],


  language     : Ember.inject.service('user-language'),
  intl         : Ember.inject.service(),
  session      : Ember.inject.service(),

  translations : Ember.computed.alias('language.locales'),

  actions: {
    selectLanguage(language) {
      let route = this.get('app.currentRouteName');

      if (route === 'login') {
        this.get('session').set(C.SESSION.LOGIN_LANGUAGE, language);
      }

      this.get('language').sideLoadLanguage(language);
    }
  },

  selected : Ember.computed('intl._locale', function() {
    return this.get('intl._locale')[0];
  }),

});
