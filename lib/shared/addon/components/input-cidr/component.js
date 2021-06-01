import Component from '@ember/component';
import ipaddr from 'ipaddr.js';
import layout from './template';
import { isEmpty } from '@ember/utils';
import { setProperties } from '@ember/object';

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
  inputId:        null,

  actions: {
    focusInHandler() {
      if (this.invalid) {
        setProperties(this, {
          invalid:      false,
          errorMessage: '',
        })
      }
    },
    focusOutHandler() {
      this.isInvalid();
    },
  },

  isInvalid() {
    const { value } = this;

    if (isEmpty(value)) {
      return true;
    }

    try {
      ipaddr.parseCIDR(value);
    } catch (error) {
      setProperties(this, {
        invalid:      true,
        errorMessage: error.message.replace('ipaddr: ', ''),
      });
    }
  }
});
