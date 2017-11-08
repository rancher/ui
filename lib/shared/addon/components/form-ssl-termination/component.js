import { get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import {
  STATUS,
  STATUS_INTL_KEY,
  classForStatus
} from 'shared/components/accordion-list-item/component';
import layout from './template';

export default Component.extend({
  layout,
  intl: service(),

  service         : null,
  allCertificates : null,

  lbConfig: alias('service.lbConfig'),

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
      return get(obj, 'id') !== def;
    });
  }.property('allCertificates.@each.id','lbConfig.defaultCertificateId'),

  defaultDidChange: function() {
    var def = this.get('lbConfig.defaultCertificateId');
    this.get('alternates').forEach((obj) => {
      if ( get(obj, 'value') === def )
      {
        set(obj,'value',null);
      }
    });
  }.observes('lbConfig.defaultCertificateId'),

  alternatesDidChange: function() {
    this.set('lbConfig.certificateIds', this.get('alternates').map((obj) => {
      return get(obj, 'value');
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
