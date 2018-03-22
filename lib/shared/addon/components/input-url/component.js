import TextField from '@ember/component/text-field';
import {isPrivate, isBadTld, stripScheme } from 'shared/utils/util';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

// const regularExpression_url = /((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
// const regularExpression_ipAddress = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
// function validateInput(val) {

//   if (val.match(regularExpression_url) || val.match(regularExpression_ipAddress) || val === '') {
//     return true;
//   }

//   return false;
// }

export default TextField.extend({
  type: 'url',
  classNameBindings: ['invalid:input-error'],
  invalid: false,
  isInvalid: null,
  urlWarning: null,
  urlError: null,
  intl: service(),
  focusOut() {
    this._super(...arguments);

    let intl = get(this, 'intl');
    let warnings =[];
    let errors = [];

    let val = stripScheme(this.element.value);

    if (isPrivate(val)) {
      warnings.addObject({
        type: 'warning',
        msg: intl.tHtml('hostSettings.notPublic.alert', {activeValue: val}),
      })
    }

    if (isBadTld(val)) {
      errors.addObject({
        type: 'error',
        msg: intl.tHtml('hostSettings.badTld.alert', {activeValue: val}),
      });
    }

    if (errors.length > 0) {
      this.get('isInvalid')(this.set('invalid', true));
      this.get('urlError')(errors);
    } else {
      this.get('isInvalid')(this.set('invalid', false));
      this.get('urlError')(errors);
    }

    if (warnings.length > 0) {
      this.get('urlWarning')(warnings);
    }

    this.set('value', val);
  }
});
