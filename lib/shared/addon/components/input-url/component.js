import TextField from '@ember/component/text-field';

const regularExpression_url = /((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
const regularExpression_ipAddress = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
function validateInput(val) {

  if (val.match(regularExpression_url) || val.match(regularExpression_ipAddress) || val === '') {
    return true;
  }

  return false;
}

export default TextField.extend({
  type: 'url',
  classNameBindings: ['invalid:input-error'],
  invalid: false,
  isInvalid: null,
  focusOut() {
    this._super(...arguments);

    let val = this.element.value;
    if (validateInput(val)) {
      this.get('isInvalid')(this.set('invalid', false));
    } else {
      this.get('isInvalid')(this.set('invalid', true));
    }

    this.set('value', val);
  }
});
