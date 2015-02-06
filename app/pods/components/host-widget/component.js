import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  classNames: ['host','resource-action-hover'],
  classNameBindings: ['stateBorder'],

  stateBackground: function() {
    return this.get('model.stateColor').replace("text-","bg-");
  }.property('model.stateColor'),

  stateBorder: function() {
    return this.get('model.stateColor').replace("text-","border-top-");
  }.property('model.stateColor'),

  iconColor: function() {
    var color = this.get('model.stateColor');
    if ( color.indexOf('danger') >= 0 )
    {
      return color;
    }
  }.property('model.stateColor'),

  boundLeave: null,
  didInsertElement: function() {
    var self = this;

    // Close the actions menu when leaving the host so it doens't show back up on enter
    var boundLeave = function() {
      self.$('.host-header .resource-actions').removeClass('open');
    }.bind(this);

    this.$().on('mouseleave', boundLeave);
  },

  willDestroyElement: function() {
    this.$().off('mouseleave', this.get('boundLeave'));
  }
});
