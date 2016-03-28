import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  cookies: Ember.inject.service(),
  github: Ember.inject.service(),
  access: Ember.inject.service(),
  settings: Ember.inject.service(),

  previousParams: null,
  previousRoute: null,

  actions: {
    loading(transition/*, originRoute*/) {
      //console.log('Loading action...');
      var show = Ember.run.next(() => {
        $('#loading-underlay').show().fadeIn({duration: 100, queue: false, easing: 'linear', complete: function() {
          $('#loading-overlay').show().fadeIn({duration: 200, queue: false, easing: 'linear'});
        }});
      });

      transition.finally(function() {
        Ember.run.cancel(show);
        Ember.run.next(() => {
          //console.log('Loading action done...');
          $('#loading-overlay').fadeOut({duration: 200, queue: false, easing: 'linear', complete: function() {
            $('#loading-underlay').fadeOut({duration: 100, queue: false, easing: 'linear'});
          }});
        });
      });

      return true;
    },

    openOverlay(template, view, model, controller) {
      view = view || 'overlay';
      return this.render(template, {
        into: 'application',
        outlet: 'overlay',
        view: view,
        model: model,
        controller: controller,
      });
    },

    closeOverlay() {
      return this.disconnectOutlet({
        parentView: 'application',
        outlet: 'overlay'
      });
    },

    error(err) {
      this.controllerFor('application').set('error',err);
      this.set('app.showArticles',false);
      this.transitionTo('failWhale');
      console.log('Application Error', (err ? err.stack : undefined));
    },

    goToPrevious(def) {
      this.goToPrevious(def);
    },

    finishLogin() {
      this.finishLogin();
    },

    logout(transition, timedOut, errorMsg) {
      var session = this.get('session');
      session.set(C.SESSION.ACCOUNT_ID,null);
      this.get('tab-session').clear();

      this.get('access').clearSessionKeys(true);

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

  finishLogin() {
    var session = this.get('session');

    var backTo = session.get(C.SESSION.BACK_TO);
    session.set(C.SESSION.BACK_TO, undefined);

    if ( backTo )
    {
      window.location.href = backTo;
    }
    else
    {
      this.replaceWith('authenticated');
    }
  },

  model(params, transition) {
    var github = this.get('github');
    var stateMsg = 'Authorization state did not match, please try again.';

    if (params.isPopup) {
      this.controllerFor('application').set('isPopup', true);
    }

    if ( params.isTest )
    {
      if ( github.stateMatches(params.state) )
      {
        reply(params.error_description, params.code);
      }
      else
      {
        reply(stateMsg);
      }
      transition.abort();
      return Ember.RSVP.reject('isTest');
    }
    else if ( params.code )
    {
      if ( github.stateMatches(params.state) )
      {
        return this.get('access').login(params.code).then(() => {
          // Can't call this.send() here because the initial transition isn't done yet
          this.finishLogin();
        }).catch((err) => {
          this.transitionTo('login', {queryParams: { errorMsg: err.message}});
        }).finally(() => {
          this.controllerFor('application').setProperties({
            state: null,
            code: null,
          });
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

  updateWindowTitle: function() {
    document.title = this.get('settings.appName');
  }.observes('settings.appName'),

  beforeModel() {
    this.updateWindowTitle();

    var agent = window.navigator.userAgent.toLowerCase();
    if ( agent.indexOf('msie ') >= 0 || agent.indexOf('trident/') >= 0 )
    {
      this.replaceWith('ie');
      return;
    }

    // Find out if auth is enabled
    return this.get('access').detect();
  },

  setupController(controller/*, model*/) {
    controller.set('code',null);
    controller.set('state',null);
    controller.set('error_description',null);
  }
});
