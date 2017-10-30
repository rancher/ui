import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    loading(transition) {
      this.incrementProperty('loadingId');
      let id = this.get('loadingId');
      Ember.run.cancel(this.get('hideTimer'));

      debugger;
      //console.log('Loading', id);
      if ( !this.get('loadingShown') ) {
        this.set('loadingShown', true);
        //console.log('Loading Show', id);

        $('#loading-underlay').stop().show().fadeIn({duration: 100, queue: false, easing: 'linear', complete: function() {
          $('#loading-overlay').stop().show().fadeIn({duration: 200, queue: false, easing: 'linear'});
        }});
      }

      transition.finally(() => {
        var self = this;
        function hide() {
          //console.log('Loading hide', id);
          self.set('loadingShown', false);
          $('#loading-overlay').stop().fadeOut({duration: 200, queue: false, easing: 'linear', complete: function() {
            $('#loading-underlay').stop().fadeOut({duration: 100, queue: false, easing: 'linear'});
          }});
        }

        if ( this.get('loadingId') === id ) {
          if ( transition.isAborted ) {
            //console.log('Loading aborted', id, this.get('loadingId'));
            this.set('hideTimer', Ember.run.next(hide));
          } else {
            //console.log('Loading finished', id, this.get('loadingId'));
            //needed to set this to run after render as there was wierdness wiht new register page
            Ember.run.scheduleOnce('afterRender', () => {
              hide();
            });
          }
        }
      });

      return true;
    },

    error(err, transition) {
      /*if we dont abort the transition we'll call the model calls again and fail transition correctly*/
      transition.abort();

      if ( err && err.status && [401,403].indexOf(err.status) >= 0 )
      {
        this.send('logout',transition,true);
        return;
      }

      this.controllerFor('application').set('error',err);
      this.transitionTo('failWhale');

      console.log('Application Error', (err ? err.stack : undefined));
    },

  }
});
