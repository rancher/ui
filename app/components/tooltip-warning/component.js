import Ember from 'ember';
import Tooltip from 'ui/mixins/tooltip';

export default Ember.Component.extend(Tooltip, {
  prefs: Ember.inject.service(),
  pipelineSvc: Ember.inject.service('pipeline'),
  classNames: ['tooltip-warning-container'],
  model: Ember.computed.alias('tooltipService.tooltipOpts.model'),
  actions: {
    hideAccessWarning: function() {
      var warningFunc = this.get('tooltipService.tooltipOpts.hideWarning');
      if(typeof warningFunc === 'function') { warningFunc.call(this); }
      this.destroyTooltip();
    },
  }
});
