import Ember from 'ember';
import Tooltip from 'ui/mixins/tooltip';
import StrippedName from 'ui/mixins/stripped-name';

export default Ember.Component.extend(Tooltip, StrippedName, {
  resourceActions:  Ember.inject.service('resource-actions'),
  needs:            ['application'],
  model:            Ember.computed.alias('tooltipService.tooltipOpts.model'),
  actionsOpen:      Ember.computed.alias('resourceActions.open'),
  inTooltip:        false,
  layoutName:       'tooltip-action-menu',

  init: function() {
    if (this.get('tooltipTemplate')) {
      this.set('layoutName', this.get('tooltipTemplate'));
    }
    this._super(...arguments);
    // Just so openChanged is ready to go, otherwise you have to chain on('init') on openChanged
    // which because of the context menu click on container dot can cause some issues with checking
    // flags and such. This was the least compliated way to ensure that openChanged would recognize changes
    this.set('actionsOpen', false);
  },

  mouseEnter: function() {
    this._super();
    this.set('inTooltip', true);

    // Must get the property before it will be observed for openChanged
    // https://github.com/emberjs/ember.js/issues/10821
    this.get('actionsOpen');
  },

  mouseLeave: function() {
    this.set('inTooltip', false);
    if ( !this.get('actionsOpen') )
    {
      this.get('tooltipService').leave();
    }
  },

  openChanged: function() {
    this.set('tooltipService.requireClick', this.get('actionsOpen'));
    if ( !this.get('actionsOpen') && !this.get('inTooltip') )
    {
      this.get('tooltipService').leave();
    }
  }.observes('actionsOpen'),

});
