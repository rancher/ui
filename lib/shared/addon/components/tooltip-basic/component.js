import { computed } from '@ember/object';
import { oneWay } from '@ember/object/computed';
import Component from '@ember/component';
import Tooltip from 'shared/mixins/tooltip';
import layout from './template';

export default Component.extend(Tooltip, {
  layout,
  needs   : ['application'],
  model   : oneWay('tooltipService.tooltipOpts.model'),
  display : null,

  selectPartial: computed('tooltipService.tooltipOpts.template', function() {
    return this.get('tooltipService.tooltipOpts.template') || 'tooltip-basic';
  })

});
