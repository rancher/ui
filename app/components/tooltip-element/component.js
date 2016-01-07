import Ember from 'ember';

export default Ember.Component.extend({
  tooltipService : Ember.inject.service('tooltip'),
  classNames     : ['inline-block'],
  model          : null,
  size           : 'default',


  mouseEnter: function(evt) {

    if (this.get('tooltipService.mouseLeaveTimer')) {
      Ember.run.cancel(this.get('tooltipService.mouseLeaveTimer'));
    }

    var node           = Ember.$(evt.currentTarget);
    var position       = node.offset();

    var out = {
      type          : this.get('type'),
      eventPosition : position,
      originalNode  : node,
      model         : this.get('model'),
      template      : this.get('tooltipTemplate'),
    };

    this.get('tooltipService').set('tooltipOpts', out);
  },

  mouseLeave: function() {
    this.get('tooltipService').set('mouseLeaveTimer', Ember.run.later(() => {
      this.get('tooltipService').set('tooltipOpts', null);
    }, 100));
  },

});
