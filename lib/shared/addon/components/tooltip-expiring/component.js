import Component from '@ember/component';
import layout from './template';
import Tooltip from 'shared/mixins/tooltip';
import { alias } from '@ember/object/computed';

export default Component.extend(Tooltip, {
  layout,

  model: alias('tooltipService.tooltipOpts.model'),

  actions: {
    rotateCertificates() {
      this.model.send('rotateCertificates')
      this.tooltipService.hide();
    }
  }
});
