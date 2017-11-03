import Ember from 'ember';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

export default Ember.Component.extend({
  intl: Ember.inject.service(),

  service         : null,
  allCertificates : null,

  lbConfig: Ember.computed.alias('service.lbConfig'),

  alternates      : null,

  init() {
    this._super(...arguments);

    var alternates = (this.get('lbConfig.certificateIds')||[]).map((id) => {
      return {value: id};
    });

    this.set('alternates', alternates);
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function(item) {
          item.toggleProperty('expanded');
      });
    }
  },

  actions: {
    addAlternate() {
      this.get('alternates').pushObject({value: null});
    },

    removeAlternate(alt) {
      this.get('alternates').removeObject(alt);
    },
  },

  alternateCertificates: function() {
    var def = this.get('lbConfig.defaultCertificateId');
    return this.get('allCertificates').slice().filter((obj) => {
      return Ember.get(obj, 'id') !== def;
    });
  }.property('allCertificates.@each.id','lbConfig.defaultCertificateId'),

  defaultDidChange: function() {
    var def = this.get('lbConfig.defaultCertificateId');
    this.get('alternates').forEach((obj) => {
      if ( Ember.get(obj, 'value') === def )
      {
        Ember.set(obj,'value',null);
      }
    });
  }.observes('lbConfig.defaultCertificateId'),

  alternatesDidChange: function() {
    this.set('lbConfig.certificateIds', this.get('alternates').map((obj) => {
      return Ember.get(obj, 'value');
    }).filter((id) => { return !!id; }).uniq());
  }.observes('alternates.@each.value'),

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },

  statusClass: null,
  status: function() {
    let k = STATUS.NONE;
    let count = this.get('lbConfig.certificateIds.length')||0;
    if ( !!this.get('lbConfig.defaultCertificateId') ) {
      count++;
    }

    if ( this.get('lbConfig.needsCertificate') && !count ) {
      k = STATUS.INCOMPLETE;
    }

    if ( count ) {
      k = STATUS.COUNTCONFIGURED;
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`, {count: count});
  }.property('lbConfig.certificateIds.[]','lbConfig.defaultCertificateId'),
});
