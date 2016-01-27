import Ember from 'ember';
import Tooltip from 'ui/mixins/tooltip';

export default Ember.Component.extend(Tooltip, {
  resourceActions: Ember.inject.service('resource-actions'),

  needs       : ['application'],
  model       : Ember.computed.alias('tooltipService.tooltipOpts.model'),
  actionsOpen : Ember.computed.alias('resourceActions.open'),
  inTooltip   : false,

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
