import Ember from 'ember';
import Util from 'ui/utils/util';

export default Ember.Mixin.create({
  reservedKeys: ['delayTimer','pollTimer'],

  replaceWith: function() {
    this._super.apply(this,arguments);
    this.transitioningChanged();
  },

  wasAdded: function() {
    this.transitioningChanged();
  },

  wasRemoved: function() {
    this.transitioningChanged();
  },

  delayTimer: null,
  clearDelay: function() {
    clearTimeout(this.get('delayTimer'));
    this.set('delayTimer', null);
  },

  pollTimer: null,
  clearPoll: function() {
    clearTimeout(this.get('pollTimer'));
    this.set('pollTimer', null);
  },

  needsPolling: function() {
    return ( this.get('transitioning') === 'yes' ) ||
           ( this.get('state') === 'requested' );
  }.property('transitioning','state'),

  transitioningChanged: function() {
    var delay = this.constructor.pollTransitioningDelay;
    var interval = this.constructor.pollTransitioningInterval;

    // This resource doesn't want polling
    if ( !delay || !interval )
    {
      return;
    }

    // This resource isn't transitioning or isn't in the store
    if ( !this.get('needsPolling') || !this.isInStore() )
    {
      this.clearPoll();
      this.clearDelay();
      return;
    }

    // We're already polling or waiting, just let that one finish
    if ( this.get('delayTimer') )
    {
      return;
    }

    this.set('delayTimer', setTimeout(function() {
      this.transitioningPoll();
    }.bind(this), Util.timerFuzz(delay)));
  }.observes('transitioning'),

  reloadOpts: function() {
    return null;
  }.property(),

  transitioningPoll: function() {
    this.clearPoll();

    if ( !this.get('needsPolling') || !this.isInStore() )
    {
      return;
    }

    //console.log('Polling', this.toString());
    this.reload(this.get('reloadOpts')).then(() => {
      //console.log('Poll Finished', this.toString());
      if ( this.get('needsPolling') )
      {
        //console.log('Rescheduling', this.toString());
        this.set('pollTimer', setTimeout(function() {
          //console.log('2 expired', this.toString());
          this.transitioningPoll();
        }.bind(this), Util.timerFuzz(this.constructor.pollTransitioningInterval)));
      }
      else
      {
        // If not transitioning anymore, stop polling
        this.clearPoll();
        this.clearDelay();
      }
    }).catch(() => {
      // If reloading fails, stop polling
      this.clearPoll();
      // but leave delay set so that it doesn't restart, (don't clearDelay())
    });
  },
});
