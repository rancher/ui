import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import Tooltip from 'shared/mixins/tooltip';
import StrippedName from 'shared/mixins/stripped-name';
import layout from './template';
import { observer } from '@ember/object';

export default Component.extend(Tooltip, StrippedName, {
  resourceActions:  service('resource-actions'),
  layout,
  needs:            ['application'],
  inTooltip:        false,
  layoutName:       'tooltip-action-menu',

  model:            alias('tooltipService.tooltipOpts.model'),
  actionsOpen:      alias('resourceActions.open'),
  init() {
    if (this.get('tooltipTemplate')) {
      this.set('layoutName', this.get('tooltipTemplate'));
    }
    this._super(...arguments);
    // Just so openChanged is ready to go, otherwise you have to chain on('init') on openChanged
    // which because of the context menu click on container dot can cause some issues with checking
    // flags and such. This was the least compliated way to ensure that openChanged would recognize changes
    this.set('actionsOpen', false);
  },

  openChanged: observer('actionsOpen', function() {
    this.set('tooltipService.requireClick', this.get('actionsOpen'));
    if ( !this.get('actionsOpen') && !this.get('inTooltip') ) {
      this.get('tooltipService').leave();
    }
  }),

  mouseEnter() {
    this._super();
    this.set('inTooltip', true);

    // Must get the property before it will be observed for openChanged
    // https://github.com/emberjs/ember.js/issues/10821
    this.get('actionsOpen');
  },

  mouseLeave() {
    this.set('inTooltip', false);
    if ( !this.get('actionsOpen') ) {
      this.get('tooltipService').leave();
    }
  },

});
