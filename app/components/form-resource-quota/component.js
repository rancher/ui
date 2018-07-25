import {  get, set, observer } from '@ember/object';
import Component from '@ember/component';
import { convertToMillis } from 'shared/utils/util';
import { parseSi } from 'shared/utils/parse-unit';
import layout from './template';

export default Component.extend({
  layout,

  limit:     null,
  editing:   null,
  addOnInit: false,

  quotaArray: null,

  init() {
    this._super(...arguments);

    this.initQuotaArray();
  },

  didInsertElement() {
    if ( get(this, 'editing') && get(this, 'quotaArray.length') === 0 && get(this, 'addOnInit') ) {
      this.send('addQuota');
    }
  },

  actions: {
    addQuota() {
      get(this, 'quotaArray').pushObject({
        key:   'pods',
        value: '',
      });
    },

    removeQuota(quota){
      get(this, 'quotaArray').removeObject(quota);
    }
  },

  quotaDidChange: observer('quotaArray.@each.{key,value}', function() {
    const out = {};

    (get(this, 'quotaArray') || []).forEach((quota) => {
      if ( quota.key && quota.value ) {
        let value = quota.value;

        if ( quota.key === 'limitsCpu' || quota.key === 'requestsCpu' ) {
          value = `${ value }m`;
        } else if ( quota.key === 'limitsMemory' || quota.key === 'requestsMemory' ) {
          value = `${ value }Mi`;
        } else if ( quota.key === 'requestsStorage' ) {
          value = `${ value }Gi`;
        }
        out[quota.key] = value;
      }
    });

    this.sendAction('changed', Object.keys(out).length ? out : null);
  }),

  initQuotaArray() {
    const limit = get(this, 'limit') || {};
    const array = [];

    Object.keys(limit).forEach((key) => {
      if ( key !== 'type' && typeof limit[key] ===  'string' ) {
        let value = limit[key];

        if ( key === 'limitsCpu' || key === 'requestsCpu' ) {
          value = convertToMillis(value);
        } else if ( key === 'limitsMemory' || key === 'requestsMemory' ) {
          value = parseSi(value, 1024) / 1048576;
        } else if ( key === 'requestsStorage' ) {
          value = parseSi(value) / (1024 ** 3);
        }

        array.push({
          key,
          value,
        });
      }
    });

    set(this, 'quotaArray', array);
  }
});
