import Ember from 'ember';
import { isMore } from 'ui/utils/platform';

export default Ember.Component.extend({
  resourceActions : Ember.inject.service('resource-actions'),
  tooltipService  : Ember.inject.service('tooltip'),
  model           : null,
  tagName         : 'div',
  classNames      : ['vertical-middle'],
  type            : 'tooltip-action-menu',
  template        : 'tooltip-container-dot',

  click(event) {
    this.details(event);
    this.get('tooltipService').hide();
  },

  alt: function() {
    return this.get('model.displayName') + ': ' + this.get('model.displayState');
  }.property('model.{displayState,displayName}'),

  details(/*event*/) {
    var route = 'container';
    if ( this.get('model.isVm') )
    {
      route = 'virtualmachine';
    }

    this.get('router').transitionTo(route, this.get('model.id'));
  },

  contextMenu(event) {
    if ( isMore(event) ) {
      return;
    }

    event.preventDefault();

    if (this.get('type') === 'tooltip-action-menu') {

      this.get('resourceActions').set('open', true);
      this.get('tooltipService').set('openedViaContextClick', true);
      Ember.$('.container-tooltip .more-actions').trigger('click');
    } else {

      this.get('resourceActions').show(this.get('model'), this.$());
    }
  },

  resourceActionsObserver: Ember.observer('resourceActions.open', function() {
    if (this.get('tooltipService.openedViaContextClick')) {
      this.get('tooltipService').set('openedViaContextClick', false);
    }
  }).on('init'),
});
