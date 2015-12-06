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

  click(event) {
    if ( isAlternate(event) )
    {
      this.contextMenu(event);
    }
    else
    {
      this.details(event);
    }
  },

  details(/*event*/) {
    var route = 'container';
    if ( this.get('model.isVm') )
    {
      route = 'virtualmachine';
    }

    this.get('router').transitionTo(route, this.get('model.id'));
  },

  contextMenu(event) {
    e.preventDefault();
    this.get('resourceActions').show(this.get('model'), this.$());
  },
});
