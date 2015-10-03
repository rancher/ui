import Ember from 'ember';
import MultiStatsSocket from 'ui/utils/multi-stats';
import { formatPercent, formatMib, formatKbps } from 'ui/utils/util';

const MAX_POINTS = 60;
const TICK_COUNT = 6;
const COLORS = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
const ALT_COLORS = ["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

export default Ember.Component.extend({
  model: null,
  linkName: 'containerStats',
  single: true,

  statsSocket: null,
  available: Ember.computed.alias('statsSocket.available'),
  active: Ember.computed.alias('statsSocket.active'),
  loading: Ember.computed.alias('statsSocket.loading'),

  cpuCanvas: '#cpuGraph',
  cpuGraph: null,
  cpuData: null,
  setCpuScale: false,

  memoryCanvas: '#memoryGraph',
  memoryGraph: null,
  memoryData: null,
  useMemoryLimit: true,
  setMemoryScale: false,

  storageCanvas: '#storageGraph',
  storageGraph: null,
  storageData: null,

  networkCanvas: '#networkGraph',
  networkGraph: null,
  networkData: null,

  renderOk: false,
  renderTimer: null,


  didInsertElement: function() {
    this._super();

    Ember.run.next(() => {
      var stats = MultiStatsSocket.create({
        resource: this.get('model'),
        linkName: this.get('linkName'),
      });

      this.set('statsSocket',stats);
      stats.on('dataPoint', (data) => { this.onDataPoint(data); });
    });
  },

  willDestroyElement: function() {
    this._super();
    this.tearDown();
    this.get('statsSocket').close();
  },

  onActiveChanged: function() {
    if ( this.get('active') )
    {
      this.setUp();
    }
    else
    {
      this.tearDown();
    }
  }.observes('active'),

  setUp() {
    this.set('renderOk', false);
    this.set('setMemoryScale', false);
    this.set('setCpuScale', false);

    if ( this.get('cpuCanvas') )
    {
      this.initCpuGraph();
    }

    if ( this.get('memoryCanvas') )
    {
      this.initMemoryGraph();
    }

    if ( this.get('storageCanvas') )
    {
      this.initStorageGraph();
    }

    if ( this.get('networkCanvas') )
    {
      this.initNetworkGraph();
    }

    clearInterval(this.get('renderTimer'));
    // Give it a second for some data to come in...
    this.set('renderTimer', setInterval(this.renderGraphs.bind(this), 1000));
  },

  tearDown() {
    ['cpuGraph','memoryGraph','storageGraph','networkGraph'].forEach((key) => {
      var obj = this.get(key);
      if ( obj )
      {
        obj.destroy();
        this.set(key,null);
      }
    });
  },

  onDataPoint(point) {
    var didSetCpuScale = false;
    var didSetMemoryScale = false;

    // CPU
    var row;
    var graph = this.get('cpuGraph');
    var data = this.get('cpuData');
    if ( data && (typeof point.cpu_total !== 'undefined') )
    {
      if ( this.get('single') )
      {
        row = getOrCreateDataRow(graph, data, 'System');
        row.push(point.cpu_system);
        row = getOrCreateDataRow(graph, data, 'User');
        row.push(point.cpu_user);
      }
      else
      {
        row = getOrCreateDataRow(graph, data, point.key);
        row.push(point.cpu_total);
      }

      if ( point.cpu_count && this.get('renderOk') && !this.get('setCpuScale') )
      {
        graph.axis.max(point.cpu_count*100);
        didSetCpuScale = true;
      }
    }

    // Memory
    graph = this.get('memoryGraph');
    data = this.get('memoryData');
    if ( data && (typeof point.mem_used_mb !== 'undefined') )
    {
      if ( this.get('single') )
      {
        row = getOrCreateDataRow(graph, data, 'Used');
      }
      else
      {
        row = getOrCreateDataRow(graph, data, point.key);
      }
      row.push(point.mem_used_mb);

      var max = Math.ceil(point.mem_total_mb || this.get('model.info.memoryInfo.memTotal'));
      if ( max && this.get('renderOk') && !this.get('setMemoryScale') )
      {
        graph.axis.max(max)
        didSetMemoryScale= true;
      }
    }

    // Network
    graph = this.get('networkGraph');
    data = this.get('networkData');
    if ( data && (typeof point.net_rx_kb !== 'undefined') )
    {
      if ( this.get('single') )
      {
        row = getOrCreateDataRow(graph, data, 'Transmit');
        row.push(point.net_tx_kb);
        row = getOrCreateDataRow(graph, data, 'Receive');
        row.push(point.net_rx_kb);
      }
      else
      {
        row = getOrCreateDataRow(graph, data, point.key);
        row.push(point.net_rx_kb + point.net_tx_kb);
      }
    }

    // Storage
    graph = this.get('storageGraph');
    data = this.get('storageData');
    if ( data && (typeof point.disk_read_kb !== 'undefined') )
    {
      if ( this.get('single') )
      {
        row = getOrCreateDataRow(graph, data, 'Write');
        row.push(point.disk_write_kb);
        row = getOrCreateDataRow(graph, data, 'Read');
        row.push(point.disk_read_kb);
      }
      else
      {
        row = getOrCreateDataRow(graph, data, point.key);
        row.push(point.disk_read_kb + point.disk_write_kb);
      }
    }

    if ( didSetMemoryScale )
    {
      this.set('setMemoryScale', true);
    }

    if ( didSetCpuScale )
    {
      this.set('setCpuScale', true);
    }

    this.set('renderOk', true);
  },

  initCpuGraph() {
    var store = this.get('store');
    var single = this.get('single');

    //console.log('Init CPU');
    var x = ['x'];
    for ( var i = 0 ; i < MAX_POINTS ; i++ )
    {
      x.push(i);
    }
    this.set('cpuData', [x]);

    var cpuGraph = c3.generate({
      bindto: this.get('cpuCanvas'),
      size: {
        height: 110,
      },
      color: { pattern: ALT_COLORS.slice() },
      data: {
        type: 'area-step',
        x: 'x',
        columns: this.get('cpuData'),
        groups: [[]], // Stacked graph, populated by getOrCreateDataRow...
        order: null,
      },
      transition: { duration: 0 },
      legend: { show: false },
      tooltip: {
        show: true,
        format: {
          title: formatSecondsAgo,
          name: formatKey.bind(this,single,store),
          value: formatPercent,
        }
      },
      axis: {
        x: {
          show: false,
        },
        y: {
          min: 0,
          max: 100,
          inner: true,
          padding: {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
          },
          tick: {
            count: TICK_COUNT,
            format: formatPercent,
          },
        },
      }
    });

    this.set('cpuGraph', cpuGraph);
  },

  initMemoryGraph() {
    var store = this.get('store');
    var single = this.get('single');

    //console.log('Init Memory');
    var x = ['x'];
    for ( var i = 0 ; i < MAX_POINTS ; i++ )
    {
      x.push(i);
    }
    this.set('memoryData', [x]);

    var memoryGraph = c3.generate({
      bindto: this.get('memoryCanvas'),
      size: {
        height: 110,
      },
      color: { pattern: COLORS.slice() },
      data: {
        type: 'area-step',
        x: 'x',
        columns: this.get('memoryData'),
        groups: [[]], // Stacked graph, populated by getOrCreateDataRow...
      },
      transition: { duration: 0 },
      legend: { show: false },
      tooltip: {
        show: true,
        format: {
          title: formatSecondsAgo,
          name: formatKey.bind(this,single,store),
          value: formatMib,
        }
      },
      axis: {
        x: {
          show: false,
        },
        y: {
          min: 0,
          inner: true,
          padding: {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
          },
          tick: {
            count: TICK_COUNT,
            format: formatMib,
          },
        },
      }
    });

    this.set('memoryGraph', memoryGraph);
  },

  initStorageGraph() {
    var store = this.get('store');
    var single = this.get('single');

    //console.log('Init Storage');
    var x = ['x'];
    for ( var i = 0 ; i < MAX_POINTS ; i++ )
    {
      x.push(i);
    }
    this.set('storageData', [x]);

    var storageGraph = c3.generate({
      bindto: this.get('storageCanvas'),
      size: {
        height: 110,
      },
      color: { pattern: ALT_COLORS.slice() },
      data: {
        type: 'area-step',
        x: 'x',
        columns: this.get('storageData'),
        groups: [[]], // Stacked graph, populated by getOrCreateDataRow...
        order: null,
      },
      transition: { duration: 0 },
      legend: { show: false },
      tooltip: {
        show: true,
        format: {
          title: formatSecondsAgo,
          name: formatKey.bind(this,single,store),
          value: formatKbps,
        },
      },
      axis: {
        x: {
          show: false,
        },
        y: {
          inner: true,
          padding: {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
          },
          tick: {
            count: TICK_COUNT,
            format: formatKbps,
          },
        },
      }
    });

    this.set('storageGraph', storageGraph);
  },

  initNetworkGraph() {
    var store = this.get('store');
    var single = this.get('single');

    //console.log('Init Network');
    var x = ['x'];
    for ( var i = 0 ; i < MAX_POINTS ; i++ )
    {
      x.push(i);
    }
    this.set('networkData', [x]);

    var networkGraph = c3.generate({
      bindto: this.get('networkCanvas'),
      size: {
        height: 110,
      },
      color: { pattern: ALT_COLORS.slice() },
      data: {
        type: 'area-step',
        x: 'x',
        columns: this.get('networkData'),
        groups: [[]], // Stacked graph, populated by getOrCreateDataRow...
        order: null,
      },
      transition: { duration: 0 },
      legend: { show: false },
      tooltip: {
        show: true,
        format: {
          title: formatSecondsAgo,
          name: formatKey.bind(this,single,store),
          value: formatKbps,
        },
      },
      axis: {
        x: {
          show: false,
        },
        y: {
          inner: true,
          padding: {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
          },
          tick: {
            count: TICK_COUNT,
            format: formatKbps,
          },
        },
      }
    });

    this.set('networkGraph', networkGraph);
  },

  renderGraphs() {
    ['cpu','memory','storage','network'].forEach((key) => {
      var graph = this.get(key+'Graph');
      var data = this.get(key+'Data');
      if ( graph && data )
      {
        graph.load({columns: data});

        // Remove the oldest point
        for ( var i = 1 ; i < data.length ; i++ )
        {
          data[i].splice(1, Math.max(0, data[i].length - 1 - MAX_POINTS));
        }
      }
    });
  },
});

function getOrCreateDataRow(graph, data, key) {
  var i;
  for ( i = 0 ; i < data.length ; i++ )
  {
    if ( data[i][0] === key )
    {
      return data[i];
    }
  }

  // Create a new row and backfill with 0's
  var newRow = [key];
  for ( i = 1 ; i < data[0].length ; i++ )
  {
    newRow.push(0);
  }
  data.push(newRow);

  // Add the new key to the graph stack
  var groups = graph.groups();
  if ( groups.length )
  {
    groups[0].push(key);
    graph.groups(groups);
  }

  return newRow;
}

function formatSecondsAgo(d) {
  var ago = Math.max(0,MAX_POINTS - d);
  return ago + ' second' + (ago === 1 ? '' : 's') + ' ago';
}

function formatKey(single, store, key /*, ratio, _id, index*/) {
  if ( single )
  {
    return key;
  }

  var [type, id] = key.split('/');
  var obj = store.getById(type, id);
  if ( obj )
  {
    return obj.get('displayName');
  }
  else
  {
    return key;
  }
}
