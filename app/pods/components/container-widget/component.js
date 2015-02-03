import Ember from 'ember';

function _globalHide(event) {
  // Don't hide if clicking within this component
  if ( this.$().has($(event.target)).length === 0 )
  {
    // Don't hide unless it's in the actions
    if ( this.$('.instance-actions').has($(event.target)).length === 0 )
    {
      this.send('hideActions');
    }
  }
}

export default Ember.Component.extend({
  model: null,
  classNames: ['instance'],
  globalHide: null,

  actions: {
    showActions: function() {
      var actions = this.$('.instance-actions');

      // Don't show again if already showing
      if ( !actions.hasClass('hide'))
      {
        return;
      }

      actions.css({width: '0px'});
      actions.removeClass('hide');
      actions.animate({width: '72px'}, 200);

      // Each instance of the component needs it's own globalHide bound to the instance,
      // but it doesnt' need to be created until show is actually called on one.
      var fn = this.get('globalHide');
      if ( !fn )
      {
        fn = _globalHide.bind(this);
        this.set('globalHide', fn);
      }

      // Add a global click handler to hide on a click elsewhere on the screen.
      // This has to be deferred or the click that got us here will immediately trigger it.
      Ember.run.next(function() {
        $(window).on('click', fn);
      });
    },

    hideActions: function() {
      // Remove the global click handler
      this.send('detachGlobalHide');

      var actions = this.$('.instance-actions');
      if ( actions && actions.length )
      {
        actions.animate({width: '0px'}, 200, 'easeOutCubic', function() {
          actions.addClass('hide');
        });
      }
    },

    detachGlobalHide: function() {
      // Cleanup when the global callback destroying the element
      var fn = this.get('globalHide');
      if ( fn )
      {
        $(window).off('click', this.get('globalHide'));
      }
    },

  },

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

  willDestroyElement: function() {
    // Remove the global click handler
    this.send('detachGlobalHide');
  }
});
