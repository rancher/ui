import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export function initialize(/* application */) {
  Route.reopen({
    router: service(),

    // Remember the current route (into the application route's previousRoute/Params properties)
    beforeModel() {
      this.rememberPrevious();
    },


    rememberPrevious() {
      const appRoute = window.l('route:application'); // The global one, not the per-engine application
      const infos    = this.router._router._routerMicrolib.currentRouteInfos;

      if ( infos && infos.length ) {
        var params = [];
        var info;

        for ( var i = 0 ; i < infos.length ; i++ ) {
          info = infos[i];
          if ( info._names && info._names.length ) {
            for ( var j = 0 ; j < info._names.length ; j++ ) {
              params.push(info.params[ info._names[j] ]);
            }
          }
        }

        if ( !info || !info.name.match(/\.?loading$/) ) {
          appRoute.set('previousRoute', info.name);
          appRoute.set('previousParams', params);
          // console.log('Set previous route to', info.name, params);
        }
      }
    },

    goToPrevious(def) {
      // var appRoute = getOwner(this).lookup('route:application');
      const appRoute = window.l('route:application'); // The global one, not the per-engine application

      var route = appRoute.get('previousRoute');

      if ( route && route !== 'loading' ) {
        var args = (appRoute.get('previousParams') || []).slice();

        args.unshift(route);

        this.transitionTo.apply(this, args).catch(() => {
          this.transitionTo('authenticated');
        });
      } else if ( def ) {
        this.transitionTo(def);
      } else {
        this.goToParent();
      }
    },

    goToParent() {
      var infos = this._router._routerMicrolib.currentHandlerInfos;

      var args = [];
      var info;
      var max = infos.length - 1;

      if (infos[infos.length - 1].name === `${ infos[infos.length - 2].name }.index` ) {
        max--;
      }

      for ( var i = 0 ; i < max ; i++ ) {
        info = infos[i];

        if ( info._names && info._names.length ) {
          for ( var j = 0 ; j < info._names.length ; j++ ) {
            args.push(info.params[ info._names[j] ]);
          }
        }
      }

      args.unshift(info.name);
      this.transitionTo.apply(this, args).catch(() => {
        this.transitionTo('authenticated');
      });
    },
  });
}

export default {
  name:       'extend-ember-route',
  initialize
};
