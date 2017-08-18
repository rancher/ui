import Ember from 'ember';
import SafeStyle from 'ui/mixins/safe-style';

export default Ember.Component.extend(SafeStyle, {
  tagName:           'span',
  value:             null,
  editable:          true,
  classesForInput:   'form-control',
  classesForDisplay: '',
  obfuscate:         false,
  obfuscatedValue: Ember.computed('value', function() {
    let val = this.get('value') || '';
    let count = val.length;
    let obChar = '*';
    return new Array(count+1).join(obChar);
  })
});
