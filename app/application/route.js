import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  previousParams: null,
  previousRoute: null,

  actions: {
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

    openOverlay: function(template, view, model, controller) {
      view = view || 'overlay';
      return this.render(template, {
        into: 'application',
        outlet: 'overlay',
        view: view,
        model: model,
        controller: controller,
      });
    },

    closeOverlay: function() {
      return this.disconnectOutlet({
        parentView: 'application',
        outlet: 'overlay'
      });
    },

    error: function(err) {
      this.controllerFor('application').set('error',err);
      this.transitionTo('failWhale');
      console.log('Application ' + err.stack);
    },

    goToPrevious: function() {
      this.goToPrevious();
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
