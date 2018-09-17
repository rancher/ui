import {  get, set, observer } from '@ember/object';
import { next } from '@ember/runloop';
import Component from '@ember/component';
import { convertToMillis } from 'shared/utils/util';
import { parseSi } from 'shared/utils/parse-unit';
import layout from './template';
import { inject as service } from '@ember/service';

export default Component.extend({
  intl: service(),

  layout,
  limit:          null,
  usedLimit:      null,
  projectlimit:   null,
  projectQuota:   null,
  nsDefaultQuota: null,

  editing:   null,

  quotaArray: null,

  init() {
    this._super(...arguments);

    this.initQuotaArray();
    next(() => {
      this.quotaDidChange();
    })
  },

  quotaDidChange: observer('quotaArray.@each.{key,value}', function() {
    const out = {};

    (get(this, 'quotaArray') || []).forEach((quota) => {
      if ( quota.key ) {
        let value = quota.value;

        if ( !value ) {
          out[quota.key] = '';

          return;
        }

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
    let limit                 = get(this, 'limit');
    const nsDefaultQuota      = get(this, 'nsDefaultQuota');
    const array               = [];
    const used                = get(this, 'usedLimit');
    const currentProjectLimit = get(this, 'projectLimit')

    Object.keys(nsDefaultQuota).forEach((key) => {
      if ( key !== 'type' && typeof nsDefaultQuota[key] ===  'string') {
        let value;
        let usedValue = '';
        let projectLimitValue = '';

        if ( limit && !limit[key] ) {
          array.push({
            key,
            value:         '',
            projectLimits: [],
          });

          return;
        }

        value = limit && limit[key] ? limit[key] : nsDefaultQuota[key];

        if ( key === 'limitsCpu' || key === 'requestsCpu' ) {
          value = convertToMillis(value);
          usedValue = convertToMillis(get(used, key));
          projectLimitValue = convertToMillis(get(currentProjectLimit, key));
        } else if ( key === 'limitsMemory' || key === 'requestsMemory' ) {
          value = parseSi(value, 1024) / 1048576;
          usedValue = parseSi(get(used, key), 1024) / 1048576;
          projectLimitValue = parseSi(get(currentProjectLimit, key), 1024) / 1048576;
        } else if ( key === 'requestsStorage' ) {
          value = parseSi(value) / (1024 ** 3);
          usedValue = parseSi(get(used, key)) / (1024 ** 3);
          projectLimitValue = parseSi(get(currentProjectLimit, key)) / (1024 ** 3);
        }

        array.push({
          key,
          value,
          max:           projectLimitValue,
          projectLimits: [{
            color: 'bg-error',
            label: key,
            value: usedValue,
          }],
          totalLimits: [{
            label: get(this, 'intl').t(`formResourceQuota.resources.${ key }`),
            value: `${ projectLimitValue - usedValue } of ${ projectLimitValue } remaining`,
          }],
        });
      }
    });

    set(this, 'quotaArray', array);
  }
});
