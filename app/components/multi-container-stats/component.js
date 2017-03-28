import Ember from 'ember';
import MultiStatsSocket from 'ui/utils/multi-stats';

const FIELDS = ['cpuUser','cpuSystem','cpuTotal','networkTx','networkRx','memory','storageWrite','storageRead'];

export default Ember.Component.extend({
  model: null,
  linkName: 'containerStats',
  maxPoints: 60,
  emitInterval: 1000,

  available: Ember.computed.alias('statsSocket.available'),
  active: Ember.computed.alias('statsSocket.active'),
  loading: Ember.computed.alias('statsSocket.loading'),

  statsSocket: null,
  emitTimer: null,

  init() {
    this._super(...arguments);
    this.set('boundEmit', this.emit.bind(this));
  },

  didReceiveAttrs() {
    this._super(...arguments);

    if ( this.get('statsSocket') )
    {
      this.disconnect();
      this.tearDown();
    }

    this.connect();
  },

  willDestroyElement: function() {
    this._super(...arguments);
    this.disconnect();
    this.tearDown();
  },

  onActiveChanged: function() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    if ( this.get('active') )
    {
      this.setUp();
    }
    else
    {
      this.tearDown();
    }
  }.observes('active'),

  connect() {
    Ember.run.next(() => {
      try {
        var stats = MultiStatsSocket.create({
          resource: this.get('model'),
          linkName: this.get('linkName'),
        });

        this.set('statsSocket',stats);
        stats.on('dataPoint', (data) => { this.onDataPoint(data); });
      } catch(e) {
      }
    });
  },

  disconnect() {
    var stats = this.get('statsSocket');
    if ( stats )
    {
      stats.close();
    }
  },

  setUp() {
    let maxPoints = this.get('maxPoints');
    FIELDS.forEach((field) => {
      let data = [];
      for ( let i = 0 ; i < maxPoints ; i++ ) {
        data[i] = 0;
      }
      this.set(field, data);
      this.set(field+'Last', {});
    });

    this.startTimer();
  },

  tearDown() {
    FIELDS.forEach((field) => {
      this.set(field, null);
      this.set(field+'Last', null);
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

    let key = point.key;

    this.get('cpuSystemLast')[key] = point.cpu_system || 0;
    this.get('cpuUserLast')[key] = point.cpu_user || 0;
    this.get('cpuTotalLast')[key] = point.cpu_total || 0;

    this.get('memoryLast')[key] = point.mem_used_mb || 0;

    this.get('networkTxLast')[key] = point.net_tx_kb*8 || 0;
    this.get('networkRxLast')[key] = point.net_rx_kb*8 || 0;

    this.get('storageWriteLast')[key] = point.disk_write_kb*8 || 0;
    this.get('storageReadLast')[key] = point.disk_read_kb*8 || 0;
  },

  emit() {
    let ary, field, valueMap, keys, sum;
    let maxPoints = this.get('maxPoints');

    for ( let i = 0 ; i < FIELDS.length ; i++ ) {
      field = FIELDS[i];
      valueMap = this.get(field+'Last');
      this.set(field+'Last',{});

      ary = this.get(field);
      sum = 0;
      field = FIELDS[i];
      keys = Object.keys(valueMap);
      for ( let j = 0 ; j < keys.length ; j++ ) {
        sum += valueMap[keys[j]];
      }

      while ( ary.get('length') >= maxPoints ) {
        ary.removeAt(0);
      }
      ary.pushObject(sum);
    }
  },
});
