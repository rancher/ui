import Ember from 'ember';

export default Ember.Mixin.create({
  actions: {
    addListener: function() {
      this.get('listenersArray').pushObject(this.get('store').createRecord({
        type: 'loadBalancerListener',
        name: 'uilistener',
        sourcePort: '',
        sourceProtocol: 'tcp',
        targetPort: '',
        targetProtocol: 'tcp',
        algorithm: 'roundrobin',
      }));
    },

    removeListener: function(obj) {
      this.get('listenersArray').removeObject(obj);
    },

    chooseProtocol: function(listener, key, val) {
      listener.set(key,val);
    },
  },

  listenersArray: null,

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
