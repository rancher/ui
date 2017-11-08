import { inject as service } from '@ember/service';
import Component from '@ember/component';
import Tooltip from 'shared/mixins/tooltip';
import C from 'ui/utils/constants';
import layout from './template';

export default Component.extend(Tooltip, {
  layout,
  prefs: service(),
  classNames: ['tooltip-warning-container'],
  actions: {
    hideAccessWarning: function() {
      this.set(`prefs.${C.PREFS.ACCESS_WARNING}`, false);
      this.destroyTooltip();
    },

  }
});
