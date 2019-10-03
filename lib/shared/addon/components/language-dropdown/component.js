import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import C from 'shared/utils/constants';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';


export default Component.extend({
  language:          service('user-language'),
  intl:              service(),
  session:           service(),
  settings:          service(),

  layout,
  tagName:           'div',
  classNames:        ['dropdown', 'language-dropdown', 'inline-block'],
  classNameBindings: ['hideSingle:hide'],

  // Set to true on login to savesession value instead of user-pref
  login:                false,
  dropdownVertPosition: 'below',
  dropdownHoriPosition: 'right',

  locales:           alias('language.locales'),

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

  hideSingle: computed('locales', function() {
    return Object.keys(this.get('locales')).length <= 1;
  }),

  selected: computed('intl.locale', function() {
    let locale = this.get('intl.locale');

    if (locale) {
      return locale[0];
    }

    return null;
  }),

  selectedLabel: computed('selected', 'locales', function() {
    let sel = this.get('selected');
    let out = '';

    if (sel) {
      out = this.get('locales')[sel];
    }

    if (!out) {
      out = 'Language';
    }

    // Strip parens for display
    return out.replace(/\s+\(.+\)$/, '');
  }),


});
