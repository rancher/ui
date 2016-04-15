import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['dropdown', 'language-dropdown', 'inline-block', 'hidden-sm', 'hidden-xs', 'pull-right'],


  language: Ember.inject.service('user-language'),
  intl    : Ember.inject.service(),

  translations: Ember.computed('language.getTranslations()@each', function() {
    return this.get('language').getTranslations();
  }),
  actions: {
    selectLanguage(language) {
      this.get('intl').setLocale(language);
    }
  }
});
