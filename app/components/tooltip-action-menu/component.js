import Ember from 'ember';
import Tooltip from 'ui/mixins/tooltip';

export default Ember.Component.extend(Tooltip, {
  needs       : ['application'],
  model       : Ember.computed.alias('tooltipService.tooltipOpts.model'),
  actionsOpen : false,

  mouseEnter: function() {
    this._super();

    Ember.$('.tooltip-more-actions').one('click', () => {

      this.set('actionsOpen', true);

      Ember.$('BODY').one('click', () => {

        this.destroyTooltip();
        this.set('actionsOpen', false);
      });
    });
  },

  mouseLeave: function() {
    if (!this.get('actionsOpen')) {
      this.set('tooltipService.mouseLeaveTimer', Ember.run.later(() => {
        this.get('tooltipService').set('tooltipOpts', null);
      }, 400));
    }
  },

});
