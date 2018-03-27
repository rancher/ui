import TextField from '@ember/component/text-field';
import {isPrivate, isBadTld, stripScheme } from 'shared/utils/util';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { debounce } from '@ember/runloop';
import { scheduleOnce } from '@ember/runloop';
import { next } from '@ember/runloop';

// const regularExpression_url = /((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
// const regularExpression_ipAddress = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
// function validateInput(val) {

//   if (val.match(regularExpression_url) || val.match(regularExpression_ipAddress) || val === '') {
//     return true;
//   }

//   return false;
// }

export default TextField.extend({
  type:              'url',
  classNameBindings: ['invalid:input-error'],
  invalid:           false,
  isInvalid:         null,
  urlWarning:        null,
  urlError:          null,
  intl:              service(),

  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => {
      this.validateInput(get(this, 'value'));
    });
  },

  _elementValueDidChange: function () {
    let val = stripScheme(get(this, 'element.value')||'');

    debounce(this, 'validateInput', val, 250);

    this.set('value', val);
  },

  focusOut() {
    this._super(...arguments);

    let val = stripScheme(get(this, 'element.value'));

    this.set('value', this.validateInput(val));
  },

  validateInput(val) {
    let warnings =[];
    let errors = [];

    if (isPrivate(val)) {
      warnings.addObject({
        type: 'warning',
        msg: 'hostSettings.notPublic.alert',
      })
    }

    if (isBadTld(val)) {
      errors.addObject({
        type: 'error',
        msg: 'hostSettings.badTld.alert',
      });
    }

   if (errors.length > 0) {
      this.get('isInvalid')(this.set('invalid', true));
      this.get('urlError')(errors);
    } else {
      this.get('isInvalid')(this.set('invalid', false));
      this.get('urlError')([]);
    }

    if (warnings.length > 0) {
      this.get('urlWarning')(warnings);
    } else {
      this.get('urlWarning')([]);
    }

    return val;
  },
});
