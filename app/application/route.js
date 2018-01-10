import RSVP, { reject } from 'rsvp';
import { cancel, next, scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';
import { get, set } from '@ember/object';

export default Route.extend({
  access         : service(),
  cookies        : service(),
  github         : service(),
  language       : service('user-language'),
  modal          : service(),
  prefs          : service(),
  settings       : service(),

  previousParams : null,
  previousRoute  : null,
  loadingShown   : false,
  loadingId      : 0,
  hideTimer      : null,
  previousLang   : null,

  actions: {
    loading(transition) {
      this.incrementProperty('loadingId');
      let id = get(this, 'loadingId');
      cancel(get(this, 'hideTimer'));

      //console.log('Loading', id);
      if ( !get(this, 'loadingShown') ) {
        set(this, 'loadingShown', true);
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

        if ( get(this, 'loadingId') === id ) {
          if ( transition.isAborted ) {
            //console.log('Loading aborted', id, get(this, 'loadingId'));
            set(this, 'hideTimer', next(hide));
          } else {
            //console.log('Loading finished', id, get(this, 'loadingId'));
            //needed to set this to run after render as there was wierdness wiht new register page
            scheduleOnce('afterRender', () => {
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

      const status = parseInt(err.status,10);
      if ( err && [401,403].includes(status) ) {
        this.send('logout',transition,true);
        return;
      }

      this.controllerFor('application').set('error',err);
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
      let session = get(this, 'session');
      let access = get(this, 'access');

      access.clearToken().finally(() => {
        session.set(C.SESSION.ACCOUNT_ID,null);

        get(this, 'tab-session').clear();
        set(this, `session.${C.SESSION.CONTAINER_ROUTE}`, undefined);

        access.clearSessionKeys();

        if ( transition && !session.get(C.SESSION.BACK_TO) ) {
          session.set(C.SESSION.BACK_TO, window.location.href);
        }

        if ( get(this, 'modal.modalVisible') ) {
          get(this, 'modal').toggleModal();
        }

        let params = {queryParams: {}};

        if ( timedOut ) {
          params.queryParams.timedOut = true;
        }

        if ( errorMsg ) {
          params.queryParams.errorMsg = errorMsg;
        }

        this.transitionTo('login', params);
      });
    },

    langToggle() {
      let svc = get(this, 'language');
      let cur = svc.getLocale();
      if ( cur === 'none' ) {
        svc.sideLoadLanguage(get(this, 'previousLang')||'en-us');
      } else {
        set(this, 'previousLang', cur);
        svc.sideLoadLanguage('none');
      }
    },
  },

  shortcuts: {
    'shift+l': 'langToggle',
  },

  finishLogin() {
    let session = get(this, 'session');

    let backTo = session.get(C.SESSION.BACK_TO);
    session.set(C.SESSION.BACK_TO, undefined);

    if ( backTo ) {
      console.log('Going back to', backTo);
      window.location.href = backTo;
    } else {
      this.replaceWith('authenticated');
    }
  },

  model(params, transition) {
    let github   = get(this, 'github');
    let stateMsg = 'Authorization state did not match, please try again.';

    get(this, 'language').initLanguage();

    transition.finally(() => {
      this.controllerFor('application').setProperties({
        state: null,
        code: null,
        error_description: null,
        redirectTo: null,
      });
    })

    if ( params.redirectTo ) {
      let path = params.redirectTo;
      if ( path.substr(0,1) === '/' ) {
        get(this, 'session').set(C.SESSION.BACK_TO, path);
      }
    }

    if (params.isPopup) {
      this.controllerFor('application').set('isPopup', true);
    }

    if ( params.isTest ) {
      if ( github.stateMatches(params.state) ) {
        reply(params.error_description, params.code);
      } else {
        reply(stateMsg);
      }

      transition.abort();

      return reject('isTest');

    } else if ( params.code ) {

      if ( github.stateMatches(params.state) ) {
        return get(this, 'access').login(params.code).then(() => {
          // Abort the orignial transition that was coming in here since
          // we'll redirect the user manually in finishLogin
          // if we dont then model hook runs twice to finish the transition itself
          transition.abort();
          // Can't call this.send() here because the initial transition isn't done yet
          this.finishLogin();
        }).catch((err) => {
          transition.abort();
          this.transitionTo('login', {queryParams: { errorMsg: err.message, errorCode: err.status}});
        }).finally(() => {
          this.controllerFor('application').setProperties({
            state: null,
            code: null,
          });
        });

      } else {

        let obj = {message: stateMsg, code: 'StateMismatch'};

        this.controllerFor('application').set('error', obj);

        return reject(obj);
      }
    }

    function reply(err,code) {
      try {
        window.opener.window.onGithubTest(err,code);
        setTimeout(function() {
          window.close();
        },250);
        return new RSVP.promise();
      } catch(e) {
        window.close();
      }
    }
  },

  updateWindowTitle: function() {
    document.title = get(this, 'settings.appName');
  }.observes('settings.appName'),

  beforeModel() {
    this.updateWindowTitle();

    let agent = window.navigator.userAgent.toLowerCase();

    if ( agent.indexOf('msie ') >= 0 || agent.indexOf('trident/') >= 0 ) {
      this.replaceWith('ie');
      return;
    }

    // Find out if auth is enabled
    return get(this, 'access').detect();
  },
});
