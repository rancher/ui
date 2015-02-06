import Ember from "ember";
import Socket from "ui/utils/socket";

/*
  Usage:

  import StatsSocket from "./stats"
  var sock = StatsSocket.create({resource: a_host_or_instance});
  sock.on('dataPoint', function(point) {
    // Do something with data
  });

  // When done
  sock.disconnect();
*/
export var StatsSocket = Ember.Object.extend(Ember.Evented, {
  resource: null,
  url: null,
  connected: false,
  prev: null,

  init: function() {
    this._super();
    this.connect();
  },

  connect: function() {
    var self = this;

    self.get('resource').followLink('stats').then(function(response) {
      //console.log(response);
      var url = response.get('url') + '?token=' + encodeURIComponent(response.get('token'));
      //console.log('url',url);

      var socket = Socket.create({
        url: url
      });

      socket.on('message', function(event) {
        if ( self.get('connected') )
        {
          self.process(JSON.parse(event.data));
        }
      });

      socket.on('connected', function(/*tries, after*/) {
        //console.log('StatsSocket connected');
        self.set('connected',true);
        self.trigger('connected');
      });

      socket.on('disconnected', function(/*tries*/) {
        //console.log('StatsSocket disconnected');
        self.set('connected',false);
        self.trigger('disconnected');
      });

      self.set('socket', socket);
      socket.connect();
    });
  },

  disconnect: function() {
    //console.log('StatsSocket disconnect');
    var socket = this.get('socket');
    if ( socket )
    {
      socket.disconnect();
    }
  },

  process: function(data) {
    //console.log('StatsSocket message',data);
    var prev = this.get('prev');
    var date = new Date(data.timestamp);

    var out = {
      date: date
    };

    if ( prev )
    {
      var prev_date = new Date(prev.timestamp);
      var time_diff_ns = (date.getTime() - prev_date.getTime())*1e6;

      // There counters are per-core, so multiply by number of cores
      if ( data.cpu.usage.per_cpu_usage )
      {
        time_diff_ns *= data.cpu.usage.per_cpu_usage.length;
      }

      if ( time_diff_ns > 1000 )
      {
        out.cpu_user    = toPercent((data.cpu.usage.user    - prev.cpu.usage.user   )/time_diff_ns);
        out.cpu_system  = toPercent((data.cpu.usage.system  - prev.cpu.usage.system )/time_diff_ns);
        out.cpu_total   = toPercent((data.cpu.usage.total   - prev.cpu.usage.total  )/time_diff_ns);
      }
    }

    if ( data.memory.usage )
    {
      out.mem_used_mb = Math.round(data.memory.usage/1048576);
    }
    else
    {
      out.mem_used_mb = 0;
    }

    if ( data.memory.limit )
    {
      out.mem_total_mb = Math.round(data.memory.limit/1048576);
    }

    if ( data.filesystem )
    {
      out.filesystem = [];
      data.filesystem.forEach(function(disk) {
        out.filesystem.push({
          device: disk.device,
          used_gb: Math.round(disk.usage/(1024*1024*1024)*10)/10,
          size_gb: Math.round(disk.capacity/(1024*1024*1024)*10)/10,
          used_percent: toPercent(disk.usage/disk.capacity),
        });
      });

      out.filesystem.sort(function(ia, ib) {
        var a = ia.device;
        var b = ib.device;
        return (a < b ? -1 : (a > b ? 1 : 0));
      });
    }

    this.set('prev', data);
    this.trigger('dataPoint', out);

    function toPercent(decimal) {
      var percent = Math.round(decimal*10000)/100;
      return Math.max(0, Math.min(percent, 100));
    }
  },
});

/*
  Usage:

  import Stats from './stats';
  var graphs = Stats.create({
    resource: a_host_or_instance,
    cpuCanvas: $('#cpuGraph')[0].getContext("2d"),
    memoryCanvas: $('#memoryGraph')[0].getContext("2d")
  });

  // Filesystem info
  stats.get('filesystem').forEach(fs) {
    console.log('Filesystem:',fs);
  });

  // When done
  sock.disconnect();
*/
var Stats = Ember.Object.extend({
  resource: null,

  statsSocket: null,
  filesystem: null,

  cpuCanvas: null,
  cpuGraph: null,
  cpuData: null,

  memoryCanvas: null,
  memoryGraph: null,
  memoryData: null,
  useMemoryLimit: true,

  maxPoints: 60,
  renderDelay: 1000,
  renderOk: false,
  firstPoint: true,

  init: function() {
    this._super();
    this.onAvailableChanged();
  },

  available: function() {
    return ['running','updating-running','active','updating-active'].indexOf(this.get('resource.state')) >= 0;
  }.property('resource.state'),

  active: Ember.computed.and('available', 'statsSocket.connected','renderOk'),

  loading: function() {
    return this.get('available') && !this.get('active');
  }.property('available','active'),

  onAvailableChanged: function() {
    //console.log('Available changed', this.get('available'));
    if ( this.get('available') )
    {
      this.setUp();
    }
    else
    {
      this.disconnect();
    }
  }.observes('available'),

  setUp: function() {
    //console.log('Stats Setup');
    if ( this.get('cpuCanvas') )
    {
      this.initCpuGraph();
    }

    if ( this.get('memoryCanvas') )
    {
      this.initMemoryGraph();
    }
    var stats = StatsSocket.create({resource: this.get('resource')});
    this.set('statsSocket',stats);
    stats.on('dataPoint', this.onDataPoint.bind(this));
  },

  onDataPoint: function(data) {
    var self = this;

    // Don't load/render any data for a bit of time, so the initial points can load in
    if ( this.get('firstPoint') )
    {
      this.set('firstPoint',false);
      setTimeout(function() {
        self.set('renderOk',true);
      }, this.get('renderDelay'));
    }

    //console.log('DataPoint', data);
    var rows;

    // Filesytem
    var fs = this.get('filesystem');
    if ( !fs )
    {
      fs = [];
      this.set('filesystem',fs);
    }

    if ( data.filesystem && JSON.stringify(fs) !== JSON.stringify(data.filesystem) )
    {
      fs.length = 0;
      data.filesystem.forEach(function(entry) {
        fs.push(entry);
      });
    }

    // CPU
    var cpuGraph = this.get('cpuGraph');
    if ( cpuGraph && (typeof data.cpu_user !== 'undefined') )
    {
      rows = this.get('cpuData');
      rows.push([data.date, data.cpu_user, data.cpu_system]);

      if ( rows.length > this.get('maxPoints') )
      {
        rows.splice(1,1);
      }

      if ( this.get('renderOk') )
      {
        cpuGraph.load({
          rows: rows
        });
      }
    }

    // Memory
    var memoryGraph = this.get('memoryGraph');
    if ( memoryGraph )
    {
      rows = this.get('memoryData');
      rows.push([data.date, data.mem_used_mb]);

      if ( rows.length > this.get('maxPoints') )
      {
        rows.splice(1,1);
      }

      if ( this.get('renderOk') )
      {
        if ( this.get('useMemoryLimit') && data.mem_total_mb )
        {
          memoryGraph.axis.max(Math.ceil(data.mem_total_mb/1000)*1000);
        }

        memoryGraph.load({
          rows: rows
        });
      }
    }
  },

  initCpuGraph: function() {
    //console.log('Init CPU');
    this.set('cpuData', [['x','User','System'],[new Date(), 0,0]]);

    var cpuGraph = c3.generate({
      bindto: this.get('cpuCanvas'),
      data: {
        type: 'area-step',
        x: 'x',
        rows: this.get('cpuData'),
        groups: [['User','System']],
      },
      transition: { duration: 0 },
      tooltip: { show: false },
      legend: {
        position: 'inset',
      },
      padding: {
        left: 40,
        right: 0,
        top: 0,
        bottom: 0,
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            culling: { max: 4 },
            format: '%H:%M:%S',
          }
        },
        y: {
          min: 0,
          max: 100,
          padding: {
            top: 0,
            bottom: 0
          },
          tick: {
            format: function(label) { return label + '%'; }
          }
        },
      }
    });

    this.set('cpuGraph', cpuGraph);
  },

  initMemoryGraph: function() {
    //console.log('Init Memory');
    this.set('memoryData', [['x','Used'],[new Date(), 0]]);

    var memoryGraph = c3.generate({
      bindto: this.get('memoryCanvas'),
      data: {
        type: 'area-step',
        x: 'x',
        rows: this.get('memoryData'),
      },
      legend: {
        position: 'inset',
      },
      padding: {
        left: 80,
        right: 0,
        top: 0,
        bottom: 0,
      },
      transition: { duration: 0 },
      tooltip: { show: false },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            culling: { max: 4 },
            format: '%H:%M:%S',
          }
        },
        y: {
          padding: {
            top: 0,
            bottom: 0
          },
          tick: {
            format: function(label) { return label + ' MB'; }
          }
        },
      }
    });

    this.set('memoryGraph', memoryGraph);
  },

  disconnect: function() {
    //console.log('Stats disconnect');
    this.set('renderOk',false);
    this.set('firstPoint',true);

    var socket = this.get('statsSocket');
    if ( socket )
    {
      socket.disconnect();
    }

    var cpuGraph = this.get('cpuGraph');
    if ( cpuGraph )
    {
      cpuGraph.destroy();
      this.set('cpuGraph',null);
    }

    var memoryGraph = this.get('memoryGraph');
    if ( memoryGraph )
    {
      memoryGraph.destroy();
      this.set('memoryGraph',null);
    }
  }
});

export default Stats;
