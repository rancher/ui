import Ember from 'ember';
import SafeStyle from 'ui/mixins/safe-style';

export function initialize(/*application */) {
  // Allow style to be bound on inputs
  Ember.TextField.reopen(SafeStyle);
  Ember.TextArea.reopen(SafeStyle);
  Ember.Checkbox.reopen(SafeStyle);

  // Disable iOS auto-capitalization
  Ember.TextField.reopen({
    attributeBindings: ['autocapitalize'],
    autocapitalize: 'none',
  });
}

export default {
  name: 'extend-ember-input',
  initialize: initialize
};
