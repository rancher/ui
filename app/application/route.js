import { get, observer, set } from '@ember/object';
import Route from '@ember/routing/route';
import { cancel, next, schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import C from 'ui/utils/constants';

export default Route.extend({
  access:   service(),
  cookies:  service(),
  language: service('user-language'),
  modal:    service(),
  prefs:    service(),
  settings: service(),

  previousParams: null,
  previousRoute:  null,
  loadingShown:   false,
  loadingId:      0,
  hideTimer:      null,
  previousLang:   null,

  shortcuts: { 'shift+l': 'langToggle', },

  beforeModel() {
    this.updateWindowTitle();

    return (async() => {
      if (!window.Prettycron) {
        window.Prettycron = await import('prettycron');
      }

      // Find out if auth is enabled
      return get(this, 'access').detect().finally(() => {
        return get(this, 'language').initLanguage();
      });
    })();
  },

  model(params, transition) {
    transition.finally(() => {
      this.controllerFor('application').setProperties({
        state:             null,
        code:              null,
        error_description: null,
      });
    })

    if (params.isPopup) {
      this.controllerFor('application').set('isPopup', true);
    }
  },

  actions: {
    didTransition() {
      this.notifyAction('did-transition');
    },
    loading(transition) {
      this.incrementProperty('loadingId');
      let id = get(this, 'loadingId');

      cancel(get(this, 'hideTimer'));

      // console.log('Loading', id);
      this.notifyAction('need-to-load');

      if ( !get(this, 'loadingShown') ) {
        set(this, 'loadingShown', true);
        // console.log('Loading Show', id);
        this.notifyLoading(true);

        schedule('afterRender', () => {
          $('#loading-underlay').stop().show().fadeIn({// eslint-disable-line
            duration: 100,
            queue:    false,
            easing:   'linear',
            complete: schedule('afterRender', function() { // eslint-disable-line
              $('#loading-overlay').stop().show().fadeIn({duration: 200, queue: false, easing: 'linear'}); // eslint-disable-line
            })
          });
        });
      }

      transition.finally(() => {
        var self = this;

        function hide() {
          // console.log('Loading hide', id);

          set(self, 'loadingShown', false);

          schedule('afterRender', () => {
            $('#loading-overlay').stop().fadeOut({// eslint-disable-line
              duration: 200,
              queue:    false,
              easing:   'linear',
              complete: schedule('afterRender', function() { // eslint-disable-line
                $('#loading-underlay').stop().fadeOut({duration: 100, queue: false, easing: 'linear'}); // eslint-disable-line
                setTimeout(() => self.notifyLoading(false), 200);
              })
            });
          });
        }

        if ( get(this, 'loadingId') === id ) {
          if ( transition.isAborted ) {
            // console.log('Loading aborted', id, get(this, 'loadingId'));
            set(this, 'hideTimer', next(hide));
          } else {
            // console.log('Loading finished', id, get(this, 'loadingId'));
            hide();
          }
        }
      });

      return true;
    },

    error(err, transition) {
      /* if we dont abort the transition we'll call the model calls again and fail transition correctly*/
      transition.abort();

      const status = parseInt(err.status, 10);

      if ( err && [401, 403].includes(status) ) {
        this.send('logout', transition);

        return;
      }

      this.controllerFor('application').set('error', err);
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
      const isEmbedded = window.top !== window;

      if ( isEmbedded ) {
        window.top.postMessage({ action: 'logout' });

        return;
      }

      access.clearToken().finally(() => {
        let url;

        if ( get(this, 'app.environment') === 'development' ) {
          url =  `${ window.location.origin }/login`;
        } else {
          url =  `${ window.location.origin }/dashboard/auth/login`;
        }

        get(this, 'tab-session').clear();
        set(this, `session.${ C.SESSION.CONTAINER_ROUTE }`, undefined);
        set(this, `session.${ C.SESSION.ISTIO_ROUTE }`, undefined);
        set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, undefined);
        set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, undefined);

        if ( transition && !session.get(C.SESSION.BACK_TO) ) {
          session.set(C.SESSION.BACK_TO, window.location.href);
        }

        if ( get(this, 'modal.modalVisible') ) {
          get(this, 'modal').toggleModal();
        }

        if ( errorMsg ) {
          url = `${ url }?errorMsg=${ errorMsg }`;
        }

        window.location.replace(url);
      });
    },

    langToggle() {
      let svc = get(this, 'language');
      let cur = svc.getLocale();

      if ( cur === 'none' ) {
        svc.sideLoadLanguage(get(this, 'previousLang') || 'en-us');
      } else {
        set(this, 'previousLang', cur);
        svc.sideLoadLanguage('none');
      }
    },
  },

  updateWindowTitle: observer('settings.appName', function() {
    document.title = get(this, 'settings.appName');
  }),

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

  notifyLoading(isLoading) {
    this.notifyAction('loading', isLoading);
  },

  notifyAction(action, state) {
    // If embedded, notify outer frame
    const isEmbedded = window !== window.top;

    if (isEmbedded) {
      window.top.postMessage({
        action,
        state
      });
    }
  }
});
