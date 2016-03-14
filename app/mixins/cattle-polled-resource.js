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

  transitioningChanged: function() {
    var delay = this.constructor.pollTransitioningDelay;
    var interval = this.constructor.pollTransitioningInterval;

    // This resource doesn't want polling
    if ( !delay || !interval )
    {
      //console.log('return 1', this.toString());
      return;
    }

    // This resource isn't transitioning or isn't in the store
    if ( this.get('transitioning') !== 'yes' || !this.isInStore() )
    {
      //console.log('return 2', this.toString());
      this.clearPoll();
      this.clearDelay();
      return;
    }

    // We're already polling or waiting, just let that one finish
    if ( this.get('delayTimer') )
    {
      //console.log('return 3', this.toString());
      return;
    }

    //console.log('Transitioning poll', this.toString());

    this.set('delayTimer', setTimeout(function() {
      //console.log('1 expired', this.toString());
      this.transitioningPoll();
    }.bind(this), Util.timerFuzz(delay)));
  }.observes('transitioning'),

  reloadOpts: function() {
    return null;
  }.property(),

  transitioningPoll: function() {
    //console.log('Maybe polling', this.toString(), this.get('transitioning'), this.isInStore());
    this.clearPoll();

    if ( this.get('transitioning') !== 'yes' || !this.isInStore() )
    {
      return;
    }

    //console.log('Polling', this.toString());
    this.reload(this.get('reloadOpts')).then(() => {
      //console.log('Poll Finished', this.toString());
      if ( this.get('transitioning') === 'yes' )
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
