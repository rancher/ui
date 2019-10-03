import { next } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import MultiStatsSocket from 'ui/utils/multi-stats';
import layout from './template';
import { observer } from '@ember/object';

const FIELDS = ['cpuUser', 'cpuSystem', 'cpuTotal', 'networkTx', 'networkRx', 'networkTotal', 'memory', 'storageWrite', 'storageRead', 'storageTotal'];

export default Component.extend({
  layout,
  model:        null,
  linkName:     'containerStats',
  maxPoints:    60,
  emitInterval: 1000,
  emitMaps:     false,
  tagName:      '',
  statsSocket:  null,
  emitTimer:    null,

  available: alias('statsSocket.available'),
  active:    alias('statsSocket.active'),
  loading:   alias('statsSocket.loading'),

  init() {
    this._super(...arguments);
    this.set('boundEmit', this.emit.bind(this));
  },

  didReceiveAttrs() {
    this._super(...arguments);

    if ( this.get('statsSocket') ) {
      this.disconnect();
      this.tearDown();
    }

    this.connect();
  },

  willDestroyElement() {
    this._super(...arguments);
    this.disconnect();
    this.tearDown();
  },

  onActiveChanged: observer('active', function() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    if ( !this.get('active') ) {
      this.tearDown();
    }
  }),

  connect() {
    next(() => {
      try {
        var stats = MultiStatsSocket.create({
          resource: this.get('model'),
          linkName: this.get('linkName'),
        });

        this.set('statsSocket', stats);
        stats.on('dataPoint', (data) => {
          this.onDataPoint(data);
        });
      } catch (e) {
      }
    });
  },

  disconnect() {
    var stats = this.get('statsSocket');

    if ( stats ) {
      stats.close();
    }
  },

  setUp() {
    FIELDS.forEach((field) => {
      let data = [];

      this.set(field, data);
      this.set(`${ field }_A`, {});
      this.set(`${ field }_B`, {});
    });

    if ( this.get('emitMaps') ) {
      let mapAry = [];

      this.set('maps', mapAry);
    }

    this.startTimer();
  },

  tearDown() {
    this.stopTimer();
    this.set('maps', null);
    FIELDS.forEach((field) => {
      this.set(field, null);
      this.set(`${ field }_A`, null);
      this.set(`${ field }_B`, null);
    });
  },

  startTimer() {
    this.stopTimer();
    this.set('emitTimer', setInterval(this.get('boundEmit'), this.get('emitInterval')));
  },

  stopTimer() {
    clearInterval(this.get('emitTimer'));
  },

  onDataPoint(point) {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    if ( !this.get('cpuSystem_A') ) {
      this.setUp();
    }

    let key = point.key;

    this.get('cpuSystem_A')[key] = point.cpu_system || 0;
    this.get('cpuUser_A')[key] = point.cpu_user || 0;
    this.get('cpuTotal_A')[key] = point.cpu_total || 0;

    this.get('memory_A')[key] = point.mem_used_mb || 0;

    this.get('networkTx_A')[key] = point.net_tx_kb * 8 || 0;
    this.get('networkRx_A')[key] = point.net_rx_kb * 8 || 0;
    this.get('networkTotal_A')[key] = this.get('networkTx_A')[key] + this.get('networkRx_A')[key];


    this.get('storageWrite_A')[key] = point.disk_write_kb * 8 || 0;
    this.get('storageRead_A')[key] = point.disk_read_kb * 8 || 0;
    this.get('storageTotal_A')[key] = this.get('storageWrite_A')[key] + this.get('storageRead_A')[key];
  },

  emit() {
    let ary, field, valueMapA, valueMapB, keys, sum;
    let maxPoints = this.get('maxPoints');

    let map = {};
    let emitMaps = this.get('emitMaps');

    for ( let i = 0 ; i < FIELDS.length ; i++ ) {
      field = FIELDS[i];
      // Average out the last 2 points from each field.
      valueMapA = this.get(`${ field }_A`);
      valueMapB = this.get(`${ field }_B`);
      this.set(`${ field }_B`, valueMapA);
      this.set(`${ field }_A`, {});

      ary = this.get(field);
      sum = 0;
      field = FIELDS[i];
      keys = Object.keys(valueMapA);
      for ( let j = 0 ; j < keys.length ; j++ ) {
        sum += valueMapA[keys[j]];
      }

      keys = Object.keys(valueMapB);
      if ( keys && keys.length ) {
        for ( let j = 0 ; j < keys.length ; j++ ) {
          sum += valueMapB[keys[j]];
        }

        sum = Math.round(sum / 2);
      }

      while ( ary.get('length') >= maxPoints ) {
        ary.removeAt(0);
      }
      ary.pushObject(sum);

      if ( emitMaps ) {
        map[field] = sum;
      }
    }

    if ( emitMaps ) {
      let mapAry = this.get('maps');

      while ( mapAry.get('length') >= maxPoints ) {
        mapAry.removeAt(0);
      }
      mapAry.push(map);
    }
  },
});
