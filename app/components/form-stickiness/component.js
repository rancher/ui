import Ember from 'ember';

export default Ember.Component.extend({
  service           : null,

  lbConfig: Ember.computed.alias('service.lbConfig'),

  lbCookie         : null,
  stickiness       : 'none',
  isNone           : Ember.computed.equal('stickiness','none'),
  isCookie         : Ember.computed.equal('stickiness','cookie'),

  modeChoices: [
    {value: 'rewrite', label: 'Rewrite'},
    {value: 'insert',  label: 'Insert'},
    {value: 'prefix',  label: 'Prefix'},
  ],

  init() {
    this._super(...arguments);

    var policy  = this.get('lbConfig.stickinessPolicy');
    var stickiness = 'none';

    if ( policy )
    {
      stickiness = 'cookie';
    }

    if ( !policy )
    {
      policy = this.get('store').createRecord({
        type: 'loadBalancerCookieStickinessPolicy'
      });
    }

    this.setProperties({
      policy: policy,
      stickiness: stickiness,
    });
  },

  stickinessDidChange: function() {
    var stickiness = this.get('stickiness');
    if ( !this.get('lbConfig.canSticky') || stickiness === 'none' )
    {
      this.set('lbConfig.stickinessPolicy', null);
    }
    else if ( stickiness === 'cookie' )
    {
      this.set('lbConfig.stickinessPolicy', this.get('policy'));
    }
  }.observes('stickiness','lbConfig.canSticky'),
});
