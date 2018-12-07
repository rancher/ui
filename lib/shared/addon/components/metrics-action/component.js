import Component from '@ember/component';
import { get, set, observer, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import C from 'ui/utils/constants';
import layout from './template';
import { next } from '@ember/runloop';
const CUSTOM = 'custom';
const PERIODS = [
  {
    label: 'metricsAction.periods.custom',
    value: CUSTOM
  },
  {
    label:    'metricsAction.periods.5m',
    value:    'now-5m',
    interval: '5s'
  },
  {
    label:    'metricsAction.periods.1h',
    value:    'now-1h',
    interval: '60s'
  },
  {
    label:    'metricsAction.periods.6h',
    value:    'now-6h',
    interval: '60s'
  },
  {
    label:    'metricsAction.periods.24h',
    value:    'now-24h',
    interval: '300s'
  },
  {
    label:    'metricsAction.periods.7d',
    value:    'now-168h',
    interval: '1800s'
  },
  {
    label:    'metricsAction.periods.30d',
    value:    'now-720h',
    interval: '3600s'
  },
];

export default Component.extend({
  intl:        service(),
  globalStore: service(),
  scope:       service(),
  prefs:       service(),

  layout,
  classNames: 'mb-20',

  resourceType:  'cluster',
  dashboardName: null,
  allowDetail:   true,

  selected:   'now-1h',
  periods:    PERIODS,

  init() {
    this._super(...arguments);
    const periodPref = get(this, `prefs.${ C.PREFS.PERIOD }`);

    if ( periodPref ) {
      set(this, 'selected', periodPref);
    }

    next(() => {
      this.query();
    });
  },

  actions: {
    refresh() {
      this.query();
    },

    fromDidChange(from) {
      if ( get(from, 'length') ) {
        set(this, 'from', get(from, 'firstObject').getTime());
      }
    },

    toDidChange(to) {
      if ( get(to, 'length') ) {
        set(this, 'to', get(to, 'firstObject').getTime());
      }
    },

    onTimePickerClose() {
      this.query(false);
    },

    toggle(detail) {
      if ( !get(this, 'state.loading') ) {
        set(this, 'state.detail', detail);
        this.query();
      }
    }
  },

  periodDidChange: observer('selected', function() {
    setProperties(this, {
      from: new Date().getTime() - 60000,
      to:   new Date().getTime(),
      now:  new Date().getTime()
    });
    if ( get(this, 'selected') !== CUSTOM ) {
      set(this, `prefs.${ C.PREFS.PERIOD }`, get(this, 'selected'));
    }

    this.query();
  }),

  query(forceRefresh = true) {
    const period = get(this, 'selected');
    let from;
    let to;
    let interval;
    let isCustom;

    if ( period !== CUSTOM ) {
      const params = PERIODS.findBy('value', get(this, 'selected'));

      from = period;
      to = 'now';
      interval = get(params, 'interval');
      isCustom = false;
    } else {
      from = get(this, 'from').toString();
      to = get(this, 'to').toString() || new Date().getTime().toString();
      interval = `${ Math.round((to - from) / 120000) }s`;
      isCustom = true;
    }
    setProperties(get(this, 'state'), {
      from,
      to,
      interval,
      isCustom
    });

    if ( period === CUSTOM ) {
      if ( !forceRefresh && get(this, 'preFrom') === from && get(this, 'preTo') === to ) {
        return;
      } else {
        setProperties(this, {
          preFrom: from,
          preTo:   to
        });
      }
    }
    this.sendAction('queryAction');
  },

});
