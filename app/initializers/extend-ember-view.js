import Ember from 'ember';
import SafeStyle from 'ui/mixins/safe-style';

export function initialize(/* container, application */) {
  // Allow style to be bound on inputs
  Ember.TextField.reopen(SafeStyle);
  Ember.TextArea.reopen(SafeStyle);
  Ember.Checkbox.reopen(SafeStyle);

  Ember.LinkComponent.reopen({
    attributeBindings: ['tooltip', 'data-placement'],
  });
}

export default {
  name: 'extend-ember-view',
  initialize: initialize
};
