import {  get, set, observer } from '@ember/object';
import Component from '@ember/component';
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
        out[quota.key] = quota.value;
      }
    });

    this.sendAction('changed', Object.keys(out).length ? out : null);
  }),

  initQuotaArray() {
    const limit = get(this, 'limit') || {};
    const array = [];

    Object.keys(limit).forEach((key) => {
      if ( key !== 'type' && typeof limit[key] ===  'string' ) {
        array.push({
          key,
          value: limit[key],
        });
      }
    });

    set(this, 'quotaArray', array);
  }
});
