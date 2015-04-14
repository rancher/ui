import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  classNames: ['subpod','resource-action-hover'],

  click: function() {
    // For touch devices, show actions on a click anywhere in the component
    if ( $('BODY').hasClass('touch') )
    {
      this.send('showActions');
    }
  },
});
