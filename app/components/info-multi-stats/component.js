import Ember from 'ember';
import MultiStatsSocket from 'ui/utils/multi-stats';
import { formatPercent, formatMib, formatKbps, pluralize } from 'ui/utils/util';

const MAX_POINTS = 60;
const TICK_COUNT = 6;

const GRADIENT_COLORS = [
  {
    type: 'cpu',
    colors: ['#2ecc71', '#DBE8B1']
  },
  {
    type: 'memory',
    colors: ['#00558b', '#AED6F1']
  },
  {
    type: 'network',
    colors: ['#e49701', '#f1c40f']

  },
  {
    type: 'storage',
    colors: ['#3a6f81', '#ABCED3']

  },
];

export default Ember.Component.extend({
  model: null,
  linkName: 'containerStats',
  single: true,
  showGraphs: true,
  showMultiStat: true,

  renderSeconds: null,

  statsSocket: null,
  available: Ember.computed.alias('statsSocket.available'),
  active: Ember.computed.alias('statsSocket.active'),
  loading: Ember.computed.alias('statsSocket.loading'),

  cpuCanvas: '#cpuGraph',
  cpuGraph: null,
  cpuData: null,
  setCpuScale: false,
  cpuD3Data: null,

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

  didReceiveAttrs() {
    if ( this.get('statsSocket') )
    {
      this.disconnect();
      this.tearDown();
    }

    this.connect();
  },

  // The SVG gradients have the path name in them, so they have to be updated when the route changes.
  routeChanged: function() {
    Ember.run.next(() => {
      let graphs = [this.get('cpuGraph'), this.get('memoryGraph'), this.get('storageGraph'), this.get('networkGraph')];
      graphs.forEach((graph) => {
        try {
          let colors = graph.internal.config.data_colors;
          Object.keys(colors).forEach((key) => {
            let neu = 'url(' + window.location.pathname + colors[key].replace(/^[^#]+/,'');
            colors[key] = neu;
          });
        } catch (e) {
          // eh....
        }
      });
    });
  }.observes('application.currentRouteName'),

  willDestroyElement: function() {
    this._super();
    this.disconnect();
    this.tearDown();
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

    this.setupMarkers();
    this.startTimer();
  },

  startTimer() {
    clearInterval(this.get('renderTimer'));
    var interval = this.get('renderSeconds');
    if ( isNaN(interval) || interval < 1 )
    {
      interval = 1;
    }

    this.set('renderTimer', setInterval(this.renderGraphs.bind(this), interval*1000));
  },

  renderSecondsChanged: function() {
    this.startTimer();
  }.observes('renderSeconds'),


setupMarkers: function() {
    var svg = d3.select('body').append('svg:svg');
    svg.attr('height','0');
    svg.attr('width','0');
    svg.style('position','absolute');
    var defs = svg.append('svg:defs');

    GRADIENT_COLORS.forEach((v) => {

      var type = v.type;

      v.colors.forEach((val, idx) => {

        var gradient = defs.append("svg:linearGradient")
            .attr('id', `${type}-${idx}-gradient`)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '100%')
            .attr('spreadMethod', 'pad');
          gradient.append('svg:stop')
            .attr('offset', '0%')
            .attr('stop-color', val)
            .attr('stop-opacity', '1');
          gradient.append('svg:stop')
            .attr('offset', '100%')
            .attr('stop-color', val)
            .attr('stop-opacity', '.4');

        });
      });
  },

  tearDown() {
    ['cpuGraph','memoryGraph','storageGraph','networkGraph'].forEach((key) => {
      var obj = this.get(key);
      if ( obj )
      {
        obj.destroy();
      }
    });

    this.setProperties({
      cpuGraph: null,
      memoryGraph: null,
      storageGraph: null,
      networkGraph: null,
      cpuData: null,
      memoryData: null,
      storageData: null,
      networkData: null,
      setMemoryScale: false,
      setCpuScale: false,
      renderSeconds: null,
    });
  },

  onDataPoint(point) {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    var didSetCpuScale = false;
    var didSetMemoryScale = false;

    if ( point.time_diff_ms )
    {
      var seconds = Math.max(1, Math.round(point.time_diff_ms/1000));
      if ( this.get('renderSeconds') )
      {
        seconds = Math.min(seconds, this.get('renderSeconds'));
      }

      //console.log('point', point.time_diff_ms, seconds, this.get('renderSeconds'));
      this.set('renderSeconds', seconds);
    }

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

      this.set('cpuD3Data', data);
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
        graph.axis.max(max);

        didSetMemoryScale = true;
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
        row.push(point.net_tx_kb*8);
        row = getOrCreateDataRow(graph, data, 'Receive');
        row.push(point.net_rx_kb*8);
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
        row.push(point.disk_write_kb*8);
        row = getOrCreateDataRow(graph, data, 'Read');
        row.push(point.disk_read_kb*8);
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
    this.set('cpuD3Data', [x]);

    var cpuGraph = c3.generate({
      padding: {
        top: 5,
        left: 75
      },
      bindto: this.get('cpuCanvas'),
      size: {
        height: 110,
      },
      data: {
        type: 'area-step',
        x: 'x',
        columns: this.get('cpuData'),
        groups: [[]], // Stacked graph, populated by getOrCreateDataRow...
        order: null,
        colors: {
          System: `url(${window.location.pathname}#cpu-0-gradient)`,
          User: `url(${window.location.pathname}#cpu-1-gradient)`,
        },
      },
      transition: { duration: 0 },
      legend: { show: false },
      tooltip: {
        show: true,
        format: {
          title: formatSecondsAgo.bind(this),
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
      },
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
      padding: {
        top: 5,
        left: 75
      },
      bindto: this.get('memoryCanvas'),
      size: {
        height: 110,
      },
      data: {
        type: 'area-step',
        x: 'x',
        columns: this.get('memoryData'),
        groups: [[]], // Stacked graph, populated by getOrCreateDataRow...
        colors: {
          Used: `url(${window.location.pathname}#memory-0-gradient)`
        },
      },
      transition: { duration: 0 },
      legend: { show: false },
      tooltip: {
        show: true,
        format: {
          title: formatSecondsAgo.bind(this),
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
      padding: {
        top: 5,
        left: 75
      },
      bindto: this.get('storageCanvas'),
      size: {
        height: 110,
      },
      data: {
        type: 'area-step',
        x: 'x',
        columns: this.get('storageData'),
        groups: [[]], // Stacked graph, populated by getOrCreateDataRow...
        order: null,
        colors: {
          Write: `url(${window.location.pathname}#storage-0-gradient)`,
          Read: `url(${window.location.pathname}#storage-1-gradient)`
        },
      },
      transition: { duration: 0 },
      legend: { show: false },
      tooltip: {
        show: true,
        format: {
          title: formatSecondsAgo.bind(this),
          name: formatKey.bind(this,single,store),
          value: formatKbps,
        },
      },
      axis: {
        x: {
          show: false,
        },
        y: {
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
    var z = [];
    for ( var i = 0 ; i < MAX_POINTS ; i++ )
    {
      x.push(i);
      z.push(i);
    }
    this.set('networkData', [x]);
    this.set('networkD3Data', z);

    var networkGraph = c3.generate({
      padding: {
        top: 5,
        left: 75
      },
      bindto: this.get('networkCanvas'),
      size: {
        height: 110,
      },
      data: {
        type: 'area-step',
        x: 'x',
        columns: this.get('networkData'),
        groups: [[]], // Stacked graph, populated by getOrCreateDataRow...
        order: null,
        colors: {
          Transmit: `url(${window.location.pathname}#network-0-gradient)`,
          Receive: `url(${window.location.pathname}#network-1-gradient)`
        },
      },
      transition: { duration: 0 },
      legend: { show: false },
      tooltip: {
        show: true,
        format: {
          title: formatSecondsAgo.bind(this),
          name: formatKey.bind(this,single,store),
          value: formatKbps,
        },
      },
      axis: {
        x: {
          show: false,
        },
        y: {
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
  var ago = Math.max(0,MAX_POINTS - d - 1) * this.get('renderSeconds');
  if ( ago === 0 )
  {
    return 'Now';
  }

  if ( ago >= 60 )
  {
    var min = Math.floor(ago/60);
    var sec = ago - 60*min;
    if ( sec > 0 )
    {
      return `${min} min, ${sec} sec ago`;
    }
    else
    {
      return pluralize(min,'minute') +  ' ago';
    }
  }

  return pluralize(ago,'second') + ' ago';
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
