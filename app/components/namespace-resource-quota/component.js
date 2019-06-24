import {  get, set, observer } from '@ember/object';
import { next } from '@ember/runloop';
import Component from '@ember/component';
import { convertToMillis } from 'shared/utils/util';
import { parseSi } from 'shared/utils/parse-unit';
import layout from './template';
import { inject as service } from '@ember/service';

const defaultRadix      = 10;
const defaultIncrement  = 1024;
const defaultDivisor    = 1048576;
const defaultMultiplier = 3;

export default Component.extend({
  intl: service(),

  layout,
  limit:          null,
  usedLimit:      null,
  projectlimit:   null,
  projectQuota:   null,
  nsDefaultQuota: null,

  editing: null,
  isNew:   null,

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
        let value      = parseInt(get(quota, 'value'), defaultRadix);
        let max        = get(quota, 'max');
        let currentUse = get(quota, 'currentProjectUse.firstObject.value');

        if ( value === undefined || value === null ) {
          out[quota.key] = '';

          return;
        }

        if (value > max || (( currentUse + value ) > max)) {
          value = set(quota, 'value', max - currentUse);
        }

        out[quota.key] = this.quotaWithUnits(quota, value);
      }
    });

    if (this.changed) {
      this.changed(Object.keys(out).length ? out : null);
    }
    this.updateLimits();
  }),

  quotaWithUnits(quota, value, readable = false) {
    let cpuNotation     = readable ? 'milli CPUs' : 'm';
    let memNotation     = readable ? 'MiB' : 'Mi';
    let storageNotation = readable ? 'GB' : 'Gi';

    if ( quota.key === 'limitsCpu' || quota.key === 'requestsCpu' ) {
      return `${ value }${ cpuNotation }`;
    } else if ( quota.key === 'limitsMemory' || quota.key === 'requestsMemory' ) {
      return `${ value }${ memNotation }`;
    } else if ( quota.key === 'requestsStorage' ) {
      return `${ value }${ storageNotation }`;
    } else {
      return value;
    }
  },

  updateLimits() {
    ( get(this, 'quotaArray') || [] ).forEach((quota) => {
      if ( quota.key ) {
        const intl        = get(this, 'intl');
        const value       = parseInt(get(quota, 'value'), defaultRadix) || 0;
        const usedValue   = get(quota, 'currentProjectUse.firstObject.value');
        const newUse      = get(quota, 'currentProjectUse.lastObject');
        const myNewUse    = usedValue + value;
        const remaining   = ( get(quota, 'max') - ( myNewUse ) ) > 0 ? ( get(quota, 'max') - ( myNewUse ) ) : 0;
        const newTotals   = [
          {
            label: intl.t('formResourceQuota.table.resources.reserved'),
            value: this.quotaWithUnits(quota, usedValue, true),
          },
          {
            label: intl.t('formResourceQuota.table.resources.namespace'),
            value: this.quotaWithUnits(quota, value, true),
          },
          {
            label: intl.t('formResourceQuota.table.resources.available'),
            value: this.quotaWithUnits(quota, remaining, true),
          },
          {
            label: intl.t('formResourceQuota.table.resources.max'),
            value: this.quotaWithUnits(quota, get(quota, 'max'), true),
          }
        ];

        // if (remaining === 0) {
        //   set(newUse, 'color', 'bg-error');
        // } else {
        //   if (get(newUse, 'color') === 'bg-error') {
        //     set(newUse, 'color', 'bg-warning');
        //   }
        // }

        set(newUse, 'value', value);
        set(quota, 'totalLimits', newTotals);
      }
    });
  },

  initQuotaArray() {
    const {
      limit,
      nsDefaultQuota,
      intl
    }                         = this;
    const used                = get(this, 'usedLimit');
    const currentProjectLimit = get(this, 'projectLimit')
    const array               = [];

    Object.keys(nsDefaultQuota).forEach((key) => {
      if ( key !== 'type' && typeof nsDefaultQuota[key] ===  'string') {
        let value, currentProjectUse, totalLimits, remaining;
        let usedValue = '';
        let max       = '';
        let newUse    = null;
        let projectUse = get(used, key) || '0';

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
          usedValue = convertToMillis(projectUse);
          max       = convertToMillis(get(currentProjectLimit, key));
          break;
        case 'limitsMemory':
        case 'requestsMemory':
          value     = parseSi(value, defaultIncrement) / defaultDivisor;
          usedValue = parseSi(projectUse, defaultIncrement) / defaultDivisor;
          max       = parseSi(get(currentProjectLimit, key), defaultIncrement) / defaultDivisor;
          break;
        case 'requestsStorage':
          value     = parseSi(value) / (defaultIncrement ** defaultMultiplier);
          usedValue = parseSi(projectUse) / (defaultIncrement ** defaultMultiplier);
          max       = parseSi(get(currentProjectLimit, key)) / (defaultIncrement ** defaultMultiplier);
          break;
        default:
          value     = parseInt(value, defaultRadix);
          usedValue = parseInt(projectUse, defaultRadix);
          max       = parseInt(get(currentProjectLimit, key), defaultRadix);
          break;
        }

        if ( !get(this, 'isNew') ) {
          usedValue = usedValue - value
        }

        newUse = usedValue + value;

        remaining = ( max - newUse ) > 0 ? ( max - newUse ) : 0;

        currentProjectUse = [
          {
            // current use
            color: 'bg-primary',
            label: key,
            value: usedValue,
          },
          {
            // only need the new value here because progress-multi-bar adds this to the previous
            color: 'bg-info',
            label: key,
            value,
          }
        ];

        totalLimits = [
          {
            label: intl.t('formResourceQuota.table.resources.reserved'),
            value: this.quotaWithUnits(nsDefaultQuota[key], usedValue, true),
          },
          {
            label: intl.t('formResourceQuota.table.resources.namespace'),
            value: this.quotaWithUnits(nsDefaultQuota[key], value, true),
          },
          {
            label: intl.t('formResourceQuota.table.resources.available'),
            value: this.quotaWithUnits(nsDefaultQuota[key], remaining, true),
          },
          {
            label: intl.t('formResourceQuota.table.resources.max'),
            value: this.quotaWithUnits(nsDefaultQuota[key], max, true),
          }
        ];

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
