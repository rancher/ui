import Component from '@ember/component';
import layout from './template';
import Tooltip from 'shared/mixins/tooltip';
import { alias } from '@ember/object/computed';

export default Component.extend(Tooltip, {
  layout,

  model: alias('tooltipService.tooltipOpts.model'),

  actions: {
    updateNodeGroup() {
      this.model.send('edit')
      this.tooltipService.hide();
    }
  }
});
