import Ember from 'ember';

export default Ember.Component.extend({
  tagName:            '',
  value:              null,
  editable:           true,
  classesForInput:    'form-control',
  classesForDisplay:  '',
  obfuscate: false,
  obfuscatedValue: Ember.computed('value', function() {
    let val = this.get('value') || '';
    let count = val.length;
    let obChar = '*';
    return new Array(count+1).join(obChar);
  })
});
