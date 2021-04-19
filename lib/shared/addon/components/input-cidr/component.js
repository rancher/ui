import Component from '@ember/component';
import ipaddr from 'ipaddr.js';
import layout from './template';
import { isEmpty } from '@ember/utils';
import { setProperties, observer } from '@ember/object';

export default Component.extend({
  layout,

  tag:         'span',
  classNames:  'input-cidr-container',
  inputStyles: '',

  value:          null,
  invalid:        false,
  errorMessage:   '',
  disabled:       null,
  placeholder:    '10.0.0.0/14',
  minSize:        24,
  maxSize:        8,
  validateMinMax: false,

  actions: {
    focusOutHandler() {
      this.isInvalid();
    },
  },

  resetErrorsOnType: observer('value', function() {
    const { invalid, errorMessage } = this;

    if (invalid && !isEmpty(errorMessage)) {
      setProperties(this, {
        invalid:      false,
        errorMessage: null,
      });
    }
  }),

  isInvalid() {
    const { value } = this;

    if (isEmpty(value)) {
      return true;
    }

    try {
      const parsed = ipaddr.parseCIDR(value);

      if (this.validateMinMax) {
        const size = parsed[1];

        // ipaddress masks are counter intuitive, larger the number the smaller the mask size. 8 > 24
        if (size > this.minSize || size < this.maxSize ) {
          setProperties(this, {
            invalid:      true,
            errorMessage: `invalid service address range: netmask must be between ${ this.minSize } and ${ this.maxSize }`,
          });
        }
      }
    } catch (error) {
      setProperties(this, {
        invalid:      true,
        errorMessage: error.message.replace('ipaddr: ', ''),
      });
    }
  }
});
