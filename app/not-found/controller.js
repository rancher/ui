import Ember from 'ember';
import C from 'ui/utils/constants';
import FallbackTranslations from 'ui/mixins/fallback-translations';

export default Ember.Controller.extend(FallbackTranslations, {
  settings: Ember.inject.service(),

  pageHeaderText: Ember.computed('intl._locale', function() {
    return this.getTranslationTextOrFallback('notFoundPage.header', C.FALLBACK_TRANSLATIONS.NOT_FOUND.HEADER);
  }),

  headerLinkText: Ember.computed('intl._locale', function() {
    return this.getTranslationTextOrFallback('notFoundPage.linkTo', C.FALLBACK_TRANSLATIONS.NOT_FOUND.LINK_TO);
  }),
});
