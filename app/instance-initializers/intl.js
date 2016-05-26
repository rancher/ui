import Ember from 'ember';
import missingMessage from 'ui/utils/intl/missing-message';
const { get, makeArray } = Ember;

export function initialize(instance) {
  var intl = instance.lookup('service:intl');

  intl.reopen({
    // calling findTranslationByKey with a null key explodes, make it return something
    _findTranslationByKey: intl.findTranslationByKey,
    findTranslationByKey(key, locales) {
      locales = makeArray(locales || get(this, '_locale'));

      if (locales[0] === 'none') {
        return missingMessage(key, locales);
      } else if ( key ) {
        return this._findTranslationByKey(...arguments);
      }else {
        return this._findTranslationByKey('generic.missing', locales);
      }
    },

    tHtml(key, ...args) {
      const [ options ] = args;
      const translation = this.findTranslationByKey(key, options && options.locale);
      return this.formatHtmlMessage(translation, ...args);
    }
  });
}

export default {
  name: 'intl',
  after: 'ember-intl',
  initialize: initialize
};
