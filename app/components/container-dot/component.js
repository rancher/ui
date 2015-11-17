import Ember from 'ember';
import { isAlternate } from 'ui/utils/platform';

export default Ember.Component.extend({
  resourceActions: Ember.inject.service('resource-actions'),

  model: null,
  tagName: 'I',

  classNames: ['dot','hand'],
  classNameBindings: ['model.stateColor','model.stateIcon'],
  attributeBindings: ['tooltip'],

  tooltip: Ember.computed.alias('model.displayName'),

  click: function(e) {
    if ( isAlternate(e) )
    {
      this.contextMenu(e);
    }
    else
    {
      this.get('router').transitionTo('container', this.get('model.id'));
    }
  },

  contextMenu: function(e) {
    e.preventDefault();
    this.get('resourceActions').show(this.get('model'), this.$());
  },
});
