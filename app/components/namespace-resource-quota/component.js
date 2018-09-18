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
    this.updateLimits();
  }),

  updateLimits() {
    ( get(this, 'quotaArray') || [] ).forEach((quota) => {
      if ( quota.key ) {
        const value       = parseInt(get(quota, 'value'), 10) || 0;
        const usedValue   = get(quota, 'currentProjectUse.firstObject.value');
        const newUse      = get(quota, 'currentProjectUse.lastObject');
        const totalLimits = get(quota, 'totalLimits.firstObject');
        const myNewUse    = usedValue + value;
        const remaining   = ( get(quota, 'max') - ( myNewUse ) ) > 0 ? ( get(quota, 'max') - ( myNewUse ) ) : 0;
        const translation = get(this, 'intl').t('formResourceQuota.table.resources.tooltip', {
          usedValue,
          remaining,
          newUse:    myNewUse,
        });

        if (remaining === 0) {
          set(newUse, 'color', 'bg-error');
        } else {
          if (get(newUse, 'color') === 'bg-error') {
            set(newUse, 'color', 'bg-warning');
          }
        }

        set(newUse, 'value', value);
        set(totalLimits, 'value', translation);
      }
    });
  },

  initQuotaArray() {
    const limit               = get(this, 'limit');
    const nsDefaultQuota      = get(this, 'nsDefaultQuota');
    const array               = [];
    const used                = get(this, 'usedLimit');
    const currentProjectLimit = get(this, 'projectLimit')
    const intl = get(this, 'intl');

    Object.keys(nsDefaultQuota).forEach((key) => {
      if ( key !== 'type' && typeof nsDefaultQuota[key] ===  'string') {
        let value, currentProjectUse, totalLimits, remaining;
        let usedValue = '';
        let max       = '';
        let newUse    = null;
        let useColorKey = 'bg-warning';

        if ( limit && !limit[key] ) {
          array.push({
            key,
            value:             '',
            currentProjectUse: [],
          });

          return;
        }

        value = limit && limit[key] ? limit[key] : nsDefaultQuota[key];

        switch (key) {
        case 'limitsCpu':
        case 'requestsCpu':
          value     = convertToMillis(value);
          usedValue = convertToMillis(get(used, key));
          max       = convertToMillis(get(currentProjectLimit, key));
          break;
        case 'limitsMemory':
        case 'requestsMemory':
          value     = parseSi(value, 1024) / 1048576;
          usedValue = parseSi(get(used, key), 1024) / 1048576;
          max       = parseSi(get(currentProjectLimit, key), 1024) / 1048576;
          break;
        case 'requestsStorage':
          value     = parseSi(value) / (1024 ** 3);
          usedValue = parseSi(get(used, key)) / (1024 ** 3);
          max       = parseSi(get(currentProjectLimit, key)) / (1024 ** 3);
          break;
        default:
          value     = parseInt(value, 10);
          usedValue = parseInt(( get(used, key) || 0 ), 10);
          max       = parseInt(get(currentProjectLimit, key), 10);
          break;
        }


        newUse = usedValue + value;

        remaining = ( max - newUse ) > 0 ? ( max - newUse ) : 0;

        if (remaining === 0) {
          useColorKey = 'bg-error';
        }

        currentProjectUse = [
          {
            // current use
            color: 'bg-error',
            label: key,
            value: usedValue,
          },
          {
            // only need the new value here because progress-multi-bar adds this to the previous
            color: useColorKey,
            label: key,
            value,
          }
        ];

        totalLimits = [{
          label: get(this, 'intl').t(`formResourceQuota.resources.${ key }`),
          value: intl.t('formResourceQuota.table.resources.tooltip', {
            usedValue,
            newUse,
            remaining,
          })
        }];

        array.push({
          currentProjectUse,
          key,
          max,
          totalLimits,
          value,
        });
      }
    });

    set(this, 'quotaArray', array);
  }
});
