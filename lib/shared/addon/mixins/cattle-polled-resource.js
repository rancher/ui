import Ember from 'ember';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  reservedKeys: ['delayTimer','pollTimer'],

  replaceWith: function() {
    this._super.apply(this,arguments);
    this.transitioningChanged();
  },

  // ember-api-store hook
  wasAdded: function() {
    this.transitioningChanged();
  },

  // ember-api-store hook
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

  remove: function() {
    return this._super().finally(() => {
      this.reload();
    });
  },

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
        let interval = this.constructor.pollTransitioningInterval;
        let factor = this.constructor.pollTransitioningIntervalFactor;
        if ( factor )
        {
          interval *= factor;
        }

        let max = this.constructor.pollTransitioningIntervalMax;
        if ( max )
        {
          interval = Math.min(max,interval);
        }

        //console.log('Rescheduling', this.toString());
        this.set('pollTimer', setTimeout(function() {
          //console.log('2 expired', this.toString());
          this.transitioningPoll();
        }.bind(this), Util.timerFuzz(interval)));
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

  stateChanged: function() {
    // Get rid of things that are removed
    if ( C.REMOVEDISH_STATES.includes(this.state) ) {
      try {
        this.clearPoll();
        this.clearDelay();
        this.get('store')._remove(this.get('type'), this);
      } catch (e) {
      }
    }
  }.observes('state'),
});
