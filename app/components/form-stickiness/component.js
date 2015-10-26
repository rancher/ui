import Ember from 'ember';

export default Ember.Component.extend({
  config: null,
  hasHttpListeners: null,

  lbCookie: null,
  appCookie: null,
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

  didInitAttrs: function() {
    var appCookie = this.get('config.appCookieStickinessPolicy');
    var lbCookie  = this.get('config.lbCookieStickinessPolicy');
    var stickiness = 'none';

    if ( appCookie )
    {
      stickiness = 'appCookie';
    }
    else if ( lbCookie )
    {
      stickiness = 'lbCookie';
    }

    if ( !appCookie )
    {
      appCookie = this.get('store').createRecord({
        type: 'loadBalancerAppCookieStickinessPolicy',
        mode: 'path_parameters',
        requestLearn: true,
        prefix: false,
        timeout: 3600000,
        maxLength: 1024,
      });
    }

    if ( !lbCookie )
    {
      lbCookie = this.get('store').createRecord({
        type: 'loadBalancerCookieStickinessPolicy'
      });
    }

    this.setProperties({
      appCookie: appCookie,
      lbCookie: lbCookie,
      stickiness: stickiness,
    });
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
