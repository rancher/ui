import Ember from 'ember';
import Tooltip from 'ui/mixins/tooltip';
import C from 'ui/utils/constants';

export default Ember.Component.extend(Tooltip, {
  prefs: Ember.inject.service(),
  classNames: ['tooltip-warning-container'],
  actions: {
    hideAccessWarning: function() {
      this.set(`prefs.${C.PREFS.ACCESS_WARNING}`, false);
      this.destroyTooltip();
    },

  }
});
