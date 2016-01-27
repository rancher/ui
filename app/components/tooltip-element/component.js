import Ember from 'ember';

const DELAY = 100;

export default Ember.Component.extend({
  tooltipService : Ember.inject.service('tooltip'),
  classNames     : ['inline-block'],
  model          : null,
  size           : 'default',

  showTimer: null,

  mouseEnter(evt) {
    if ( !this.get('tooltipService.requireClick') )
    {
      var tgt = Ember.$(evt.currentTarget);

      // Wait for a little bit of time so that the mouse can pass through
      // another tooltip-element on the way to the dropdown trigger of a
      // tooltip-action-menu without changing the tooltip.
      this.set('showTimer', Ember.run.later(() => {
        this.show(tgt);
      }, DELAY));
    }
  },

  show(node) {
    this.set('showTimer', null);
    this.get('tooltipService').cancelTimer();

    var out = {
      type          : this.get('type'),
      eventPosition : node.offset(),
      originalNode  : node,
      model         : this.get('model'),
      template      : this.get('tooltipTemplate'),
    };

    this.get('tooltipService').set('tooltipOpts', out);
  },

  mouseLeave: function() {
    if ( this.get('showTimer') )
    {
      Ember.run.cancel(this.get('showTimer'));
    }
    else
    {
      this.get('tooltipService').leave();
    }
  },
});
