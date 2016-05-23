import Ember from 'ember';
import C from 'ui/utils/constants';
import FallbackTranslations from 'ui/mixins/fallback-translations';

export default Ember.Controller.extend(FallbackTranslations, {
  settings : Ember.inject.service(),

  pageHeaderText: Ember.computed('intl._locale', function() {
    return this.getTranslationTextOrFallback('failWhalePage.header', C.FALLBACK_TRANSLATIONS.FAILWHALE.HEADER);
  }),

  reloadButtonText: Ember.computed('intl._locale', function() {
    return this.getTranslationTextOrFallback('failWhalePage.reloadButton', C.FALLBACK_TRANSLATIONS.FAILWHALE.RELOAD_BUTTON);
  }),

  logoutButtonText: Ember.computed('intl._locale', function() {
    return this.getTranslationTextOrFallback('failWhalePage.logoutButton', C.FALLBACK_TRANSLATIONS.FAILWHALE.LOGOUT_BUTTON);
  }),

});
