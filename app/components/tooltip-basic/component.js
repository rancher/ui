import Ember from 'ember';
import Tooltip from 'ui/mixins/tooltip';

export default Ember.Component.extend(Tooltip, {
  needs   : ['application'],
  model   : Ember.computed.alias('tooltipService.tooltipOpts.model'),
  display : null,

  selectPartial: function() {
    var template = this.get('tooltipService.tooltipOpts.template');
    var out      = template;

    if (!template) {
      out = 'tooltip-basic';
    }

    return out;
  }.property('tooltipService.tooltipOpts.template')

});
