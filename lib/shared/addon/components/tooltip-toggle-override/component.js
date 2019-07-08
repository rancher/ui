import Component from '@ember/component';
import layout from './template';
import Tooltip from 'shared/mixins/tooltip';
import { alias } from '@ember/object/computed';

export default Component.extend(Tooltip, {
  layout,

  allowOverride: false,

  model: alias('tooltipService.tooltipOpts.model'),
});
