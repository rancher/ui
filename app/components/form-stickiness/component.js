import Ember from 'ember';

export default Ember.Component.extend({
  config           : null,
  hasHttpListeners : null,

  lbCookie         : null,
  stickiness       : 'none',
  isStickyNone     : Ember.computed.equal('stickiness','none'),
  isStickyLbCookie : Ember.computed.equal('stickiness','lbCookie'),

  lbCookieModeChoices: [
    {value: 'rewrite', label: 'Rewrite'},
    {value: 'insert', label: 'Insert'},
    {value: 'prefix', label: 'Prefix'},
  ],

  init() {
    this._super(...arguments);

    var lbCookie  = this.get('config.lbCookieStickinessPolicy');
    var stickiness = 'none';

    if ( lbCookie )
    {
      stickiness = 'lbCookie';
    }

    if ( !lbCookie )
    {
      lbCookie = this.get('store').createRecord({
        type: 'loadBalancerCookieStickinessPolicy'
      });
    }

    this.setProperties({
      lbCookie: lbCookie,
      stickiness: stickiness,
    });
  },

  stickinessDidChange: function() {
    var stickiness = this.get('stickiness');
    if ( stickiness === 'none' )
    {
      this.set('config.lbCookieStickinessPolicy', null);
    }
    else if ( stickiness === 'lbCookie' )
    {
      this.set('config.lbCookieStickinessPolicy', this.get('lbCookie'));
    }
  }.observes('stickiness'),
});
