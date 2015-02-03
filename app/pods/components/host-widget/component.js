import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  classNames: ['host'],
  classNameBindings: ['stateBorder'],
  boundEnter: null,
  boundLeave: null,

  actions: {
    showActions: function() {
      this.$().addClass('hover');
    },

    hideActions: function() {
      this.$().removeClass('hover');
    },
  },

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

  didInsertElement: function() {
    var boundEnter = onEnter.bind(this);
    var boundLeave = onLeave.bind(this);

    this.set('boundEnter', boundEnter);
    this.set('boundLeave', boundLeave);

    this.$('.host-header').on('mouseenter', boundEnter);
    this.$('.host-header').on('mouseleave', boundLeave);

    function onEnter() {
      this.send('showActions');
    }

    function onLeave() {
      this.send('hideActions');
    }
  },

  willDestroyElement: function() {
    this.$('.host-header').off('mouseenter', this.get('boundEnter'));
    this.$('.host-header').off('mouseleave', this.get('boundLeave'));
  },
});
