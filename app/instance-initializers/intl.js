import { get } from '@ember/object';
import missingMessage from 'ui/utils/intl/missing-message';

export function initialize(instance) {
  let intl = instance.lookup('service:intl');
  let adapter = get(intl, '_adapter');

  adapter.reopen({
    _lookup: adapter.lookup,
    lookup(locale, key) {
      if (locale === 'none') {
        return missingMessage(key, locale);
      } else if ( key ) {
        return this._lookup(locale, key);
      } else {
        return this._lookup(locale, 'generic.missing');
      }
    },
  });
}

export default {
  name:       'intl',
  initialize
};
