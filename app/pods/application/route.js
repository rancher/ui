import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  actions: {
    beforeModel: function() {
      this._super.apply(this,arguments);
      var err = this.get('app.initError');
      if ( err )
      {
        this.send('error',err);
      }
    },

    loading: function(transition/*, originRoute*/) {
      //console.log('Loading action...');
      $('#loading-underlay').show().fadeIn({duration: 100, queue: false, easing: 'linear', complete: function() {
        $('#loading-overlay').show().fadeIn({duration: 200, queue: false, easing: 'linear'});
      }});

      transition.finally(function() {
        //console.log('Loading action done...');
        $('#loading-underlay').fadeOut({duration: 100, queue: false, easing: 'linear', complete: function() {
          $('#loading-overlay').fadeOut({duration: 200, queue: false, easing: 'linear'});
        }});
      });

      return true;
    },

    error: function(err) {
      this.controller.set('error',err);
      this.transitionTo('failWhale');
      console.log('Application ' + err.stack);
    },

    logout: function(transition,timedOut) {
      var session = this.get('session');
      session.clear();
      session.set(C.LOGGED_IN, false);
      this.set('app.afterLoginTransition', transition);
      var params = {queryParams: {}};

      if ( timedOut )
      {
        params.queryParams.timedOut = true;
      }

      this.transitionTo('login', params);
    }
  },
});
