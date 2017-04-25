import Ember from 'ember';
import missingMessage from 'ui/utils/intl/missing-message';
const { get, makeArray } = Ember;

export function initialize(instance) {
  let intl = instance.lookup('service:intl');
  let adapter = intl.get('adapter');

  adapter.reopen({
    _lookup: adapter.lookup,
    lookup(locales, key) {
      locales = makeArray(locales || get(this, 'locale'));

      if (locales[0] === 'none') {
        return missingMessage(key, locales);
      } else if ( key ) {
        return this._lookup(locales, key);
      }else {
        return this._lookup(locales, 'generic.missing');
      }
    },
  });

  // @TODO use regular t with htmlSafe instead
  intl.reopen({
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
