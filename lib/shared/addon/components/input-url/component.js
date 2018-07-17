import TextField from '@ember/component/text-field';
import {
  isPrivate, isBadTld, stripScheme
} from 'shared/utils/util';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { debounce } from '@ember/runloop';
import { scheduleOnce } from '@ember/runloop';

// const regularExpression_url = /((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
// const regularExpression_ipAddress = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
// function validateInput(val) {

//   if (val.match(regularExpression_url) || val.match(regularExpression_ipAddress) || val === '') {
//     return true;
//   }

//   return false;
// }

export default TextField.extend({
  intl:              service(),

  type:              'url',
  classNameBindings: ['invalid:input-error'],
  invalid:           false,
  isInvalid:         null,
  urlWarning:        null,
  urlError:          null,
  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => {
      let val = stripScheme(get(this, 'value') || '');

      set(this, 'value', this.validateInput(val));
    });
  },

  _elementValueDidChange() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    let val = stripScheme(get(this, 'element.value') || '');

    debounce(this, 'validateInput', val, 250);

    set(this, 'value', val);
  },

  focusOut() {
    this._super(...arguments);

    let val = stripScheme(get(this, 'element.value'));

    set(this, 'value', this.validateInput(val));
  },

  validateInput(val) {
    let warnings = [];
    let errors = [];

    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    if (isPrivate(val)) {
      warnings.addObject({
        type: 'warning',
        msg:  'hostSettings.notPublic.alert',
      })
    }

    if (isBadTld(val)) {
      errors.addObject({
        type: 'error',
        msg:  'hostSettings.badTld.alert',
      });
    }

    if (errors.length > 0) {
      get(this, 'isInvalid')(set(this, 'invalid', true));
      get(this, 'urlError')(errors);
    } else {
      get(this, 'isInvalid')(set(this, 'invalid', false));
      get(this, 'urlError')([]);
    }

    if (warnings.length > 0) {
      get(this, 'urlWarning')(warnings);
    } else {
      get(this, 'urlWarning')([]);
    }

    return val;
  },
});
