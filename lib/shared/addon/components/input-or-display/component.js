import { computed } from '@ember/object';
import Component from '@ember/component';
import SafeStyle from 'shared/mixins/safe-style';
import layout from './template';
import { isEmpty } from '@ember/utils';


export default Component.extend(SafeStyle, {
  layout,

  tagName:           'span',
  value:             null,
  editable:          true,
  classesForInput:   'form-control',
  classesForDisplay: '',
  obfuscate:         false,

  obfuscatedValue:   computed('value', function() {
    let val = this.get('value') || '';
    let count = val.length;
    let obChar = '*';

    return new Array(count + 1).join(obChar);
  }),

  hasValue: computed('value', function() {
    return !isEmpty(this.value);
  }),
});
