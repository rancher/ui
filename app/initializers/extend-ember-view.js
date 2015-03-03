import Ember from "ember";

export function initialize(/* container, application */) {
  // Allot tooltip and style to be bound on all views
  Ember.View.reopen({
    attributeBindings: ['tooltip','style'],
  });
}

export default {
  name: 'extend-ember-view',
  initialize: initialize
};
