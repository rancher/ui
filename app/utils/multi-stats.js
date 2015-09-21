import Ember from "ember";
import Socket from "ui/utils/socket";

/*
  Usage:

  import MultiStatsSocket from "./multi-stats"
  var sock = StatsSocket.create({resource: a_resource_with_stats, linkName: 'containerStats or hostStats'});
  sock.on('dataPoint', function(point) {
    // Do something with data
  });

  // When done
  sock.close();
*/
export default Ember.Object.extend(Ember.Evented, {
  resource: null,
  linkName: 'containerStats',

  connected: false,
  prev: null,
  closed: false,

  init() {
    this._super();
    this.onAvailableChanged();
  },

  available: function() {
    return ['running','updating-running','active','updating-active','unhealthy'].indexOf(this.get('resource.state')) >= 0;
  }.property('resource.state'),

  active: Ember.computed.and('available', 'connected'),

  loading: function() {
    return this.get('available') && !this.get('connected');
  }.property('available','connected'),

  onAvailableChanged: function() {
    if ( this.get('available') )
    {
      this.connect();
    }
    else
    {
      this.disconnect();
    }
  }.observes('available'),

  connect() {
    if ( this.get('socket') || this.get('closed') )
    {
      return;
    }

    this.set('prev', {});
    this.get('resource').followLink(this.get('linkName')).then((response) => {
      var url = response.get('url') + '?token=' + encodeURIComponent(response.get('token'));

      var socket = Socket.create({url: url});

      socket.on('message', (event) => {
        if ( this.get('connected') )
        {
          //console.log('message', event);
          JSON.parse(event.data).forEach((row) => {
            //console.log('row', row);
            this.process(row);
          });
        }
      });

      socket.on('connected', (/*tries, after*/) => {
        this.set('connected',true);
        this.trigger('connected');
      });

      socket.on('disconnected', (/*tries*/) => {
        this.set('connected',false);
        this.trigger('disconnected');
      });

      this.set('socket', socket);
      socket.connect();
    });
  },

  disconnect() {
    this.set('connected',false);

    var socket = this.get('socket');
    if ( socket )
    {
      socket.disconnect();
      this.set('socket', null);
    }
  },

  close() {
    this.set('closed', true);
    this.disconnect();
  },

  process(data) {
    //console.log('process', data.id, data);
    var key = data.resourceType + '/' + data.id;
    var prev = this.get('prev')[key];

    var ts = roundTsFromString(data.timestamp);

    var out = {
      key: key,
      id: data.id,
      resourceType: data.resourceType,
      ts: ts,
    };

    if ( prev )
    {
      // Don't use `ts` here, need the unrounded time to get accurate CPU usage
      var time_diff_ms = (tsFromString(data.timestamp) - tsFromString(prev.timestamp));
      var time_diff_ns = time_diff_ms*1e6;
      var time_diff_s = time_diff_ms/1000;
      var count = 1;

      // CPU
      // These counters are per-core, so multiply by number of cores
      if ( data.cpu.usage.per_cpu_usage )
      {
        count = data.cpu.usage.per_cpu_usage.length;
        time_diff_ns *= count;
      }

      if ( time_diff_ns > 1000 )
      {
        out.cpu_user    = toPercent((data.cpu.usage.user    - prev.cpu.usage.user   )/time_diff_ns);
        out.cpu_system  = toPercent((data.cpu.usage.system  - prev.cpu.usage.system )/time_diff_ns);
        out.cpu_total   = toPercent((data.cpu.usage.total   - prev.cpu.usage.total  )/time_diff_ns);
        out.cpu_count   = count;
      }

      if ( data.diskio && data.diskio.io_service_bytes )
      {
        var read = 0;
        var write = 0;
        data.diskio.io_service_bytes.forEach((io) => {
          if ( io && io.stats )
          {
            read += io.stats.Read || 0;
            write += io.stats.Write || 0;
          }
        });

        prev.diskio.io_service_bytes.forEach((io) => {
          if ( io && io.stats )
          {
            read -= io.stats.Read || 0;
            write -= io.stats.Write || 0;
          }
        });

        out.disk_read_kb = read/(time_diff_s*1024);
        out.disk_write_kb = write/(time_diff_s*1024);
      }

      // Network
      if ( data.network )
      {
        out.net_rx_kb = Math.max(0, (data.network.rx_bytes - prev.network.rx_bytes)/(time_diff_s*1024));
        out.net_tx_kb = Math.max(0, (data.network.tx_bytes - prev.network.tx_bytes)/(time_diff_s*1024));

        if ( data.network.interfaces && prev.network.interfaces )
        {
          data.network.interfaces.forEach((iface) => {
            var prev_iface =  prev.network.interfaces.filterBy('name', iface.name)[0];
            if ( prev_iface )
            {
              out.net_rx_kb += Math.max(0, (iface.rx_bytes - prev_iface.rx_bytes)/(time_diff_s*1024));
              out.net_tx_kb += Math.max(0, (iface.tx_bytes - prev_iface.tx_bytes)/(time_diff_s*1024));
            }
          });
        }
      }
    }

    // Memory
    if ( data.memory )
    {
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
    }


    this.get('prev')[key] = data;
    this.trigger('dataPoint', out);
  },
});

function tsFromString(str) {
  return new Date(str).getTime();
}

function roundTsFromString(str) {
  var ts = tsFromString(str);
  var ms = ts % 1000;
  if ( ms >= 500 )
  {
    return ts-ms+1000;
  }
  else
  {
    return ts-ms;
  }
}

function toPercent(decimal) {
  var percent = Math.round(decimal*10000)/100;
  return Math.max(0, Math.min(percent, 100));
}

