import Ember from 'ember';


export default Ember.Component.extend({
  model: null,
  classNames: ['instance','resource-action-hover'],

  click: function() {
    // For touch devices, show actions on a click anywhere in the component
    if ( $('BODY').hasClass('touch') )
    {
      this.send('showActions');
    }
  },

  stateBackground: function() {
    return this.get('model.stateColor').replace("text-","bg-");
  }.property('model.stateColor'),

  boundLeave: null,
  didInsertElement: function() {
    var self = this;

    // Close the actions menu when leaving the host so it doens't show back up on enter
    var boundLeave = function() {
      self.$('.resource-actions').removeClass('open');
    }.bind(this);

    this.$().on('mouseleave', boundLeave);
  },

  willDestroyElement: function() {
    this.$().off('mouseleave', this.get('boundLeave'));
  }
});
