import Ember from "ember";

export function initialize(/* container, application */) {
  Ember.Route.reopen({

    // Remember the current route (into the application route's previousRoute/Params properties)
    beforeModel: function() {
      this._super.apply(this,arguments);

      var appRoute = this.container.lookup('route:application');
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
          console.log('Set previous route to', info.name, params);
        }
      }
    },

    getParentRoute: function(){
      var infos = this.router.router.currentHandlerInfos;
      var parent, current;

      for ( var i=0 ; i < infos.length ; i++ )
      {
        current = infos[i].handler;
        if ( (current.routeName == this.routeName)
             || (current.routeName.match(/./) && current.routeName.split('.')[1] == this.routeName )
           )
        {
          if ( parent )
          {
            return parent.routeName;
          }
        }
        parent = current;
      }

      return 'index';
    },

    goToPrevious: function() {
      var appRoute = this.container.lookup('route:application');
      var route = appRoute.get('previousRoute');
      if ( !route || route === 'loading' )
      {
        return this.goToParent();
      }

      var args = (appRoute.get('previousParams')||[]).slice();
      args.unshift(route);

      this.transitionTo.apply(this,args).catch(() => {
        this.transitionTo('index');
      });
    },

    goToParent: function() {
      this.transitionTo(this.getParentRoute());
    },
  });
}

export default {
  name: 'extend-ember-route',
  initialize: initialize
};
