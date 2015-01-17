import Ember from 'ember';

export default Ember.Route.extend({
  previousRoute: null,
  previousParams: null,

  beforeModel: function() {
    this._super.apply(this,arguments);
    var infos = this.router.router.currentHandlerInfos;
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

    this.set('previousRoute', info.name);
    this.set('previousParams', params);
  },

  actions: {
    goToPrevious: function() {
      var route = this.get('previousRoute');
      if ( route === 'loading' )
      {
        route = 'index';
      }

      var args = (this.get('previousParams')||[]).slice();
      args.unshift(route);
      var res = this.transitionTo.apply(this,args);

      res.catch(function() {
        this.transitionTo('index');
      });
    },
  }
});
