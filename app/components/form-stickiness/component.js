import Ember from 'ember';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';
import C from 'ui/utils/constants';
import ManageLabels from 'ui/mixins/manage-labels';

export default Ember.Component.extend(ManageLabels, {
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

    this.initLabels(this.get('initialLabels'), null, C.LABEL.BALANCER_TARGET);
    var target = this.getLabel(C.LABEL.BALANCER_TARGET)||'any';

    this.setProperties({
      policy: policy,
      stickiness: stickiness,
      balancerTarget: target,
    });
  },

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },

  stickinessDidChange: function() {
    if (this.get('lbConfig')) {
      var stickiness = this.get('stickiness');
      if ( !this.get('lbConfig.canSticky') || stickiness === 'none' )
      {
        this.set('lbConfig.stickinessPolicy', null);
      }
      else if ( stickiness === 'cookie' )
      {
        this.set('lbConfig.stickinessPolicy', this.get('policy'));
      }
    }
  }.observes('stickiness','lbConfig.canSticky'),

  balancerTargetDidChange: function() {
    let target = this.get('balancerTarget');
    if ( target === 'any' ) {
      this.removeLabel(C.LABEL.BALANCER_TARGET, true);
    } else {
      this.setLabel(C.LABEL.BALANCER_TARGET, target);
    }
  }.observes('balancerTarget'),

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
