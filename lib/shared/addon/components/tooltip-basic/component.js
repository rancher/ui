import Ember from 'ember';
import Tooltip from 'shared/mixins/tooltip';

export default Ember.Component.extend(Tooltip, {
  needs   : ['application'],
  model   : Ember.computed.oneWay('tooltipService.tooltipOpts.model'),
  display : null,

  selectPartial: Ember.computed('tooltipService.tooltipOpts.template', function() {
    return this.get('tooltipService.tooltipOpts.template') || 'tooltip-basic';
  })

});
