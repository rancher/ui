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

        appRoute.set('previousRoute', info.name);
        appRoute.set('previousParams', params);
        //console.log('Set previous route to', info.name, params);
      }
    },
  });
}

export default {
  name: 'extend-ember-route',
  initialize: initialize
};
