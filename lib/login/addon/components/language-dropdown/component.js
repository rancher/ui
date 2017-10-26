import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  // Set to true on login to savesession value instead of user-pref
  login        : false,

  tagName      : 'div',
  classNames   : ['dropdown', 'language-dropdown', 'inline-block'],
  classNameBindings: ['hideSingle:hide'],

  language     : Ember.inject.service('user-language'),
  intl         : Ember.inject.service(),
  session      : Ember.inject.service(),
  settings     : Ember.inject.service(),

  locales : Ember.computed.alias('language.locales'),

  hideSingle: function() {
    return Object.keys(this.get('locales')).length <= 1;
  }.property('locales'),

  actions: {
    selectLanguage(language) {
      if (this.get('login')) {
        this.get('session').set(C.SESSION.LOGIN_LANGUAGE, language);
      }

      this.get('language').sideLoadLanguage(language).then(() => {
        if (!this.get('login')) {
          this.get('language').setLanguage(language);
        }
      });
    }
  },

  selected : Ember.computed('intl.locale', function() {
    let locale = this.get('intl.locale');
    if (locale) {
      return locale[0];
    }
    return null;
  }),

  selectedLabel: Ember.computed('selected','locales', function() {
    let sel = this.get('selected');
    let out = '';
    if (sel) {
      out = this.get('locales')[sel];
    }

    if (!out) {
      out = 'Language';
    }

    // Strip parens for display
    return out.replace(/\s+\(.+\)$/,'');
  }),

});
