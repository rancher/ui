import { observer, computed } from '@ember/object';
import $ from 'jquery';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { isMore } from 'ui/utils/platform';
import layout from './template';
import { on } from '@ember/object/evented';

export default Component.extend({
  resourceActions: service('resource-actions'),
  tooltipService:  service('tooltip'),
  router:          service(),

  layout,
  model:           null,
  tagName:         'div',
  classNames:      ['vertical-middle'],
  type:            'tooltip-action-menu',
  template:        'tooltip-container-dot',
  alt:        computed('model.{displayState,displayName}', function() {
    return `${ this.get('model.displayName')  }: ${  this.get('model.displayState') }`;
  }),

  resourceActionsObserver: on('init', observer('resourceActions.open', function() {
    if (this.get('tooltipService.openedViaContextClick')) {
      this.get('tooltipService').set('openedViaContextClick', false);
    }
  })),
  click(event) {
    this.details(event);
    this.get('tooltipService').hide();
  },

  details(/* event*/) {
    var route = 'pod';

    if ( this.get('model.isVm') ) {
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
      $('.container-tooltip .more-actions').trigger('click');
    } else {
      this.get('resourceActions').setActionItems(this.get('model'), {});
    }
  },

});
