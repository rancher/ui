import Ember from 'ember';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

export default Ember.Component.extend({
  service           : null,
  intl: Ember.inject.service(),

  classNames: ['accordion-wrapper'],

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

  statusClass: null,
  status: function() {
    let k = STATUS.NOTCONFIGURED;

    if ( this.get('stickiness') === 'cookie' ) {
      k = STATUS.CONFIGURED;
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`);
  }.property('stickiness'),
});
