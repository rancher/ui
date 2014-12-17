import Ember from "ember";

export function initialize(/* container, application */) {
  Ember.View.reopen({
    attributeBindings: ['tooltip'],
  });
}

export default {
  name: 'extend-ember-view',
  initialize: initialize
};
