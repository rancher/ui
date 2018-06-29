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

        $('#loading-underlay').stop().show().fadeIn({duration: 100, queue: false, easing: 'linear', complete: function() { // eslint-disable-line
          $('#loading-overlay').stop().show().fadeIn({duration: 200, queue: false, easing: 'linear'}); // eslint-disable-line
        }});
      }

      transition.finally(() => {
        var self = this;
        function hide() {
          //console.log('Loading hide', id);
          self.set('loadingShown', false);
          $('#loading-overlay').stop().fadeOut({duration: 200, queue: false, easing: 'linear', complete: function() { // eslint-disable-line
            $('#loading-underlay').stop().fadeOut({duration: 100, queue: false, easing: 'linear'}); // eslint-disable-line
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
        this.send('logout',transition);
        return;
      }

      this.controllerFor('application').set('error',err);
      this.transitionTo('failWhale');

      // console.log('Application Error', (err ? err.stack : undefined));
    },

    goToPrevious(def) {
      this.goToPrevious(def);
    },

    finishLogin() {
      this.finishLogin();
    },

    logout(transition, errorMsg) {
      let session = get(this, 'session');
      let access = get(this, 'access');

      access.clearToken().finally(() => {
        get(this, 'tab-session').clear();
        set(this, `session.${C.SESSION.CONTAINER_ROUTE}`, undefined);
        set(this, `session.${C.SESSION.CLUSTER_ROUTE}`, undefined);
        set(this, `session.${C.SESSION.PROJECT_ROUTE}`, undefined);

        if ( transition && !session.get(C.SESSION.BACK_TO) ) {
          session.set(C.SESSION.BACK_TO, window.location.href);
        }

        if ( get(this, 'modal.modalVisible') ) {
          get(this, 'modal').toggleModal();
        }

        let params = {queryParams: {}};

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
      // console.log('Going back to', backTo);
      window.location.href = backTo;
    } else {
      this.replaceWith('authenticated');
    }
  },

  model(params, transition) {

    transition.finally(() => {
      get(this, 'language').initLanguage();
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
  },

  updateWindowTitle: function() {
    document.title = get(this, 'settings.appName');
  }.observes('settings.appName'),

  beforeModel() {
    this._super(...arguments);
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
