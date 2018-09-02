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

    this.sendAction('changed', out);
  }),

  convertToString(key, value) {
    if ( !value ) {
      return '';
    }

    if ( key === 'limitsCpu' || key === 'requestsCpu' ) {
      value = `${ value }m`;
    } else if ( key === 'limitsMemory' || key === 'requestsMemory' ) {
      value = `${ value }Mi`;
    } else if ( key === 'requestsStorage' ) {
      value = `${ value }Gi`;
    }

    return value;
  },

  convertToLimit(key, value) {
    if ( !value ) {
      return '';
    }

    if ( key === 'limitsCpu' || key === 'requestsCpu' ) {
      value = convertToMillis(value);
    } else if ( key === 'limitsMemory' || key === 'requestsMemory' ) {
      value = parseSi(value, 1024) / 1048576;
    } else if ( key === 'requestsStorage' ) {
      value = parseSi(value) / (1024 ** 3);
    }

    return value;
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
