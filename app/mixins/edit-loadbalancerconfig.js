import Ember from 'ember';
import EditHealthCheck from 'ui/mixins/edit-healthcheck';

export default Ember.Mixin.create(EditHealthCheck,{
  actions: {
    addListener: function() {
      this.get('listenersArray').pushObject(this.get('store').createRecord({
        type: 'loadBalancerListener',
        name: 'uilistener',
        isPublic: true,
        sourcePort: '',
        sourceProtocol: 'http',
        targetPort: '',
        targetProtocol: 'http',
        algorithm: 'roundrobin',
      }));
    },

    removeListener: function(obj) {
      this.get('listenersArray').removeObject(obj);
    },

    chooseProtocol: function(listener, key, val) {
      listener.set(key,val);
    },

    setPublic: function(listener, isPublic) {
      listener.set('isPublic', isPublic);
    },
  },

  listenersArray: null,
  initListeners: function() {
    var store = this.get('store');
    var out = [];
    var existingService = this.get('balancer.loadBalancerListeners');
    var existingRegular = this.get('listeners');
    if ( existingService )
    {
      existingService.forEach((listener) => {
        var neu = listener.cloneForNew();
        neu.setProperties({
          serviceId: null,
          name: null,
        });
        out.push(neu);
      });
    }
    else if ( existingRegular )
    {
      out.pushObjects(existingRegular);
    }
    else
    {
      out.push(store.createRecord({
        type: 'loadBalancerListener',
        name: 'uilistener',
        isPublic: true,
        sourcePort: '',
        sourceProtocol: 'http',
        targetPort: '',
        targetProtocol: 'http',
        algorithm: 'roundrobin',
      }));
    }

    this.set('listenersArray', out);
  },

  sourceProtocolOptions: function() {
    return this.get('store').getById('schema','loadbalancerlistener').get('resourceFields.sourceProtocol.options');
  }.property(),

  targetProtocolOptions: function() {
    return this.get('store').getById('schema','loadbalancerlistener').get('resourceFields.targetProtocol.options');
  }.property(),

  algorithmOptions: function() {
    return this.get('store').getById('schema','loadbalancerlistener').get('resourceFields.algorithm.options');
  }.property(),

  stickiness: 'none',
  isStickyNone: Ember.computed.equal('stickiness','none'),
  isStickyLbCookie: Ember.computed.equal('stickiness','lbCookie'),
  isStickyAppCookie: Ember.computed.equal('stickiness','appCookie'),

  lbCookieModeChoices: [
    {value: 'rewrite', label: 'Rewrite'},
    {value: 'insert', label: 'Insert'},
    {value: 'prefix', label: 'Prefix'},
  ],

  appCookieModeChoices: [
    {value: 'path_parameters', label: 'Path Parameter'},
    {value: 'query_string', label: 'Query String'},
  ],

  initStickiness: function() {
    if ( this.get('config.appCookieStickinessPolicy') )
    {
      this.set('stickiness', 'appCookie');
    }
    else if ( this.get('config.lbCookieStickinessPolicy') )
    {
      this.set('stickiness', 'lbCookie');
    }
    else
    {
      this.set('stickiness','none');
    }
  },

  stickinessDidChange: function() {
    var stickiness = this.get('stickiness');
    if ( stickiness === 'none' )
    {
      this.set('config.lbCookieStickinessPolicy', null);
      this.set('config.appCookieStickinessPolicy', null);
    }
    else if ( stickiness === 'lbCookie' )
    {
      this.set('config.lbCookieStickinessPolicy', this.get('lbCookie'));
      this.set('config.appCookieStickinessPolicy', null);
    }
    else if ( stickiness === 'appCookie' )
    {
      this.set('config.lbCookieStickinessPolicy', null);
      this.set('config.appCookieStickinessPolicy', this.get('appCookie'));
    }
  }.observes('stickiness'),
});
