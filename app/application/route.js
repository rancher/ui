import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  cookies: Ember.inject.service(),
  github: Ember.inject.service(),

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
      this.set('app.showArticles',false);
      this.transitionTo('failWhale');
      console.log('Application Error', (err ? err.stack : undefined));
    },

    goToPrevious: function() {
      this.goToPrevious();
    },

    logout: function(transition, timedOut, errorMsg) {
      var session = this.get('session');
      // This needs to change first so that other tabs get notified and logout
      session.set(C.SESSION.ACCOUNT_ID,null);

      session.clear();
      this.get('cookies').remove(C.COOKIE.TOKEN);

      if ( transition )
      {
        session.set(C.SESSION.BACK_TO, window.location.href);
      }

      var params = {queryParams: {}};

      if ( timedOut )
      {
        params.queryParams.timedOut = true;
      }

      if ( errorMsg )
      {
        params.queryParams.errorMsg = errorMsg;
      }

      this.transitionTo('login', params);
    }
  },

  model: function(params, transition) {
    var github = this.get('github');
    var session = this.get('session');
    var stateMsg = 'Authorization state did not match, please try again.';

    if ( params.isTest )
    {
      if ( github.stateMatches(params.state) )
      {
        return reply(params.error_description, params.code);
      }
      else
      {
        return reply(stateMsg);
      }
    }
    else if ( params.code )
    {
      if ( github.stateMatches(params.state) )
      {
        return github.login(params.code).then(() => {
          var backTo = session.get(C.SESSION.BACK_TO);
          session.set(C.SESSION.BACK_TO, undefined);

          if ( backTo )
          {
            window.location.href = backTo;
          }
          else
          {
            this.replaceWith('index');
          }
        }).catch((err) => {
          this.controllerFor('application').setProperties({
            state: null,
            code: null,
          });
          transition.send('logout', null, null, err.message);
        });
      }
      else
      {
        var obj = {message: stateMsg, code: 'StateMismatch'};
        this.controllerFor('application').set('error', obj);
        return Ember.RSVP.reject(obj);
      }
    }

    function reply(err,code) {
      try {
        window.opener.window.onGithubTest(err,code);
        setTimeout(function() {
          window.close();
        },250);
        return new Ember.RSVP.promise();
      }
      catch(e) {
        window.close();
      }
    }
  },

  beforeModel: function() {
    var agent = window.navigator.userAgent.toLowerCase();
    if ( agent.indexOf('msie ') >= 0 || agent.indexOf('trident/') >= 0 || agent.indexOf('edge/') >= 0 )
    {
      this.replaceWith('ie');
      return;
    }

    // Find out if auth is enabled
    return this.get('store').rawRequest({
      url: 'token',
      headers: {
        [C.HEADER.PROJECT]: undefined
      }
    })
    .then((obj) => {
      // If we get a good response back, the API supports authentication
      var body = JSON.parse(obj.xhr.responseText);
      var token = body.data[0];

      this.set('app.authenticationEnabled', token.security);
      this.set('app.githubClientId', token.clientId);
      this.set('app.githubHostname', token.hostname );

      if ( !token.security )
      {
        this.get('github').clearSessionKeys();
      }

      return Ember.RSVP.resolve(undefined,'API supports authentication');
    })
    .catch((obj) => {
      // Otherwise this API is too old to do auth.
      this.set('app.authenticationEnabled', false);
      this.set('app.initError', obj);
      return Ember.RSVP.resolve(undefined,'Error determining API authentication');
    });
  },

  setupController: function(controller/*, model*/) {
    controller.set('code',null);
    controller.set('state',null);
    controller.set('error_description',null);
  }
});
