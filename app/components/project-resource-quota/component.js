import {  get, set, observer } from '@ember/object';
import Component from '@ember/component';
import { convertToMillis } from 'shared/utils/util';
import { parseSi } from 'shared/utils/parse-unit';
import layout from './template';

export default Component.extend({
  layout,

  limit:          null,
  nsDefaultLimit: null,
  editing:        null,

  quotaArray: null,

  init() {
    this._super(...arguments);

    this.initQuotaArray();
  },

  actions: {
    addQuota() {
      get(this, 'quotaArray').pushObject({
        key:            '',
        projectLimit:   '',
        namespaceLimit: '',
      });
    },

    removeQuota(quota){
      get(this, 'quotaArray').removeObject(quota);
    }
  },

  quotaDidChange: observer('quotaArray.@each.{key,projectLimit,namespaceLimit}', function() {
    const limit = {};
    const nsDefaultLimit = {};

    (get(this, 'quotaArray') || []).forEach((quota) => {
      if ( quota.key && (quota.projectLimit || quota.namespaceLimit) ) {
        limit[quota.key] = this.convertToString(quota.key, quota.projectLimit);
        nsDefaultLimit[quota.key] = this.convertToString(quota.key, quota.namespaceLimit);
      }
    });

    let out = null;

    if ( Object.keys(limit).length ) {
      out = {
        resourceQuota:                 { limit },
        namespaceDefaultResourceQuota: { limit: nsDefaultLimit },
      }
    }

    if (this.changed) {
      this.changed(out);
    }
  }),

  convertToString(key, value) {
    if ( !value ) {
      return '';
    }

    switch (key) {
    case 'limitsCpu':
    case 'requestsCpu':
      return `${ value }m`;
    case 'limitsMemory':
    case 'requestsMemory':
      return `${ value }Mi`;
    case 'requestsStorage':
      return `${ value }Gi`;
    default:
      return value;
    }
  },

  convertToLimit(key, value) {
    if ( !value ) {
      return '';
    }

    switch (key) {
    case 'limitsCpu':
    case 'requestsCpu':
      return convertToMillis(value);
    case 'limitsMemory':
    case 'requestsMemory':
      return parseSi(value, 1024) / 1048576;
    case 'requestsStorage':
      return parseSi(value) / (1024 ** 3);
    default:
      return value;
    }
  },

  initQuotaArray() {
    const limit = get(this, 'limit') || {};
    const nsDefaultLimit = get(this, 'nsDefaultLimit') || {};
    const array = [];

    Object.keys(limit).forEach((key) => {
      if ( key !== 'type' && typeof limit[key] ===  'string' ) {
        const projectLimit = this.convertToLimit(key, limit[key]);
        const namespaceLimit = this.convertToLimit(key, nsDefaultLimit[key]);

        array.push({
          key,
          projectLimit,
          namespaceLimit,
        });
      }
    });

    set(this, 'quotaArray', array);
  }
});
