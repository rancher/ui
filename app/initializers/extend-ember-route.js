import Ember from "ember";

const { getOwner } = Ember;

export function initialize(/*application */) {
  Ember.Route.reopen({

    // Remember the current route (into the application route's previousRoute/Params properties)
    beforeModel: function() {
      this._super.apply(this,arguments);
      this.rememberPrevious();
    },

    rememberPrevious: function() {
      var appRoute = getOwner(this).lookup('route:application');
      var infos = this.router.router.currentHandlerInfos;
      if ( infos && infos.length )
      {
        var params = [];
        var info;
        for ( var i = 0 ; i < infos.length ; i++ )
        {
          info = infos[i];
          if ( info._names && info._names.length )
          {
            for ( var j = 0 ; j < info._names.length ; j++ )
            {
              params.push(info.params[ info._names[j] ]);
            }
          }
        }

        if ( !info || !info.name.match(/\.?loading$/) )
        {
          appRoute.set('previousRoute', info.name);
          appRoute.set('previousParams', params);
          //console.log('Set previous route to', info.name, params);
        }
      }
    },

    goToPrevious: function(def) {
      var appRoute = getOwner(this).lookup('route:application');
      var route = appRoute.get('previousRoute');
      if ( !route || route === 'loading' )
      {
        if ( def )
        {
          this.transitionTo(def);
        }
        else
        {
          return this.goToParent();
        }
      }

      var args = (appRoute.get('previousParams')||[]).slice();
      args.unshift(route);

      this.transitionTo.apply(this,args).catch(() => {
        this.transitionTo('authenticated');
      });
    },

    goToParent: function() {
      var infos = this.router.router.currentHandlerInfos;

      var args = [];
      var info;
      var max = infos.length - 1;
      if (infos[infos.length - 1].name === infos[infos.length-2].name+'.index' )
      {
        max--;
      }

      for ( var i = 0 ; i < max ; i++ )
      {
        info = infos[i];

        if ( info._names && info._names.length )
        {
          for ( var j = 0 ; j < info._names.length ; j++ )
          {
            args.push(info.params[ info._names[j] ]);
          }
        }
      }

      args.unshift(info.name);
      this.transitionTo.apply(this,args).catch(() => {
        this.transitionTo('authenticated');
      });
    },
  });
}

export default {
  name: 'extend-ember-route',
  initialize: initialize
};
