import { cancel, next, schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';
import { get, set, observer } from '@ember/object';

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
    loading(transition) {
      this.incrementProperty('loadingId');
      let id = get(this, 'loadingId');

      cancel(get(this, 'hideTimer'));

      // console.log('Loading', id);
      if ( !get(this, 'loadingShown') ) {
        set(this, 'loadingShown', true);
        // console.log('Loading Show', id);

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

      access.clearToken().finally(() => {
        let url =  `${ window.location.origin }/login`;

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

});
