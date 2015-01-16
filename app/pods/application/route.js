import Ember from 'ember';

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

    error: function(err) {
      this.controller.set('error',err);
      this.transitionTo('failWhale');
      console.log('Application ' + err.stack);
    },

    logout: function(transition,timedOut) {
      this.set('session.isLoggedIn',0);
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
