import { and } from '@ember/object/computed';
import EmberObject, { computed, observer } from '@ember/object';
import Evented from '@ember/object/evented';
import { run } from '@ember/runloop';
import Socket from 'shared/utils/socket';
import C from 'shared/utils/constants';

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
export default EmberObject.extend(Evented, {
  resource: null,
  linkName: 'containerStats',

  connected: false,
  prev:      null,
  closed:    false,

  init() {
    this._super();
    this.onAvailableChanged();
  },

  available: computed('resource.{state,healthState}', function() {
    return C.ACTIVEISH_STATES.indexOf(this.get('resource.state')) >= 0 && this.get('resource.healthState') !== 'started-once';
  }),

  active: and('available', 'connected'),

  loading: computed('available', 'connected', function() {
    return this.get('available') && !this.get('connected');
  }),

  onAvailableChanged: observer('available', function() {
    if ( this.get('available') ) {
      this.connect();
    } else {
      this.disconnect();
    }
  }),

  connect() {
    if ( this.get('socket') || this.get('closed') ) {
      return;
    }

    this.set('prev', {});
    if ( this.get('resource').hasLink(this.get('linkName')) ) {
      this.get('resource').followLink(this.get('linkName')).then((response) => {
        let token = response.get('authToken') || response.get('token');

        if ( response.get('url') && token ) {
          // Send the fixed-size auth token in query string if present
          var url = `${ response.get('url')  }?token=${  encodeURIComponent(token) }`;

          var socket = Socket.create({
            url,
            autoReconnect: false
          });

          socket.on('message', (event) => {
            if ( this.get('connected') ) {
              // console.log('message', event);
              JSON.parse(event.data).forEach((row) => {
                // console.log('row', row);
                this.process(row);
              });
            }
          });

          socket.on('connected', (/* tries, after*/) => {
            // Send the big token
            if ( response.get('token') && response.get('authToken') ) {
              socket.send(response.get('token'));
            }

            this.set('connected', true);
            this.trigger('connected');
          });

          socket.on('disconnected', (/* tries*/) => {
            this.set('connected', false);
            this.trigger('disconnected');
            this.set('socket', null);
            run.next(this, 'connect');
          });

          this.set('socket', socket);
          socket.connect();
        }
      });
    }
  },

  disconnect() {
    this.set('connected', false);

    var socket = this.get('socket');

    if ( socket ) {
      socket.disconnect();
      this.set('socket', null);
    }
  },

  close() {
    this.set('closed', true);
    this.disconnect();
  },

  process(data) {
    // console.log('process', data.id, data);
    var key = `${ data.resourceType  }/${  data.id }`;
    var prev = this.get('prev')[key];

    var ts = roundTsFromString(data.timestamp);

    var out = {
      key,
      id:           data.id,
      resourceType: data.resourceType,
      ts,
    };

    if ( prev ) {
      // Don't use `ts` here, need the unrounded time to get accurate CPU usage
      var time_diff_ms = (tsFromString(data.timestamp) - tsFromString(prev.timestamp));

      // Duplicate data point, ignore
      if ( time_diff_ms === 0 ) {
        return;
      }

      var time_diff_ns = time_diff_ms * 1e6;
      var time_diff_s = time_diff_ms / 1000;

      out.time_diff_ms = time_diff_ms;

      // CPU
      var count = 1;

      if ( data.cpu.usage.per_cpu_usage ) {
        count = data.cpu.usage.per_cpu_usage.length;
      }

      out.cpu_user    = toPercent((data.cpu.usage.user    - prev.cpu.usage.user   ) / time_diff_ns, count * 100);
      out.cpu_system  = toPercent((data.cpu.usage.system  - prev.cpu.usage.system ) / time_diff_ns, count * 100);
      out.cpu_total   = toPercent((data.cpu.usage.total   - prev.cpu.usage.total  ) / time_diff_ns, count * 100);
      out.cpu_count   = count;

      var read = 0;
      var write = 0;

      if ( data.diskio && data.diskio.io_service_bytes && prev.diskio && prev.diskio.io_service_bytes) {
        // Minus the last point
        prev.diskio.io_service_bytes.forEach((io) => {
          if ( io && io.stats ) {
            read -= io.stats.Read || 0;
            write -= io.stats.Write || 0;
          }
        });

        // Plus the current point
        data.diskio.io_service_bytes.forEach((io) => {
          if ( io && io.stats ) {
            read += io.stats.Read || 0;
            write += io.stats.Write || 0;
          }
        });
      }
      out.disk_read_kb = Math.max(0, read / (time_diff_s * 1024));
      out.disk_write_kb = Math.max(0, write / (time_diff_s * 1024));

      // Network
      if ( data.network ) {
        if ( data.network.interfaces && prev.network.interfaces ) {
          data.network.interfaces.forEach((iface) => {
            var prev_iface =  prev.network.interfaces.filterBy('name', iface.name)[0];

            if ( prev_iface ) {
              out.net_rx_kb = (out.net_rx_kb || 0) + Math.max(0, (iface.rx_bytes - prev_iface.rx_bytes) / (time_diff_s * 1024));
              out.net_tx_kb = (out.net_tx_kb || 0) + Math.max(0, (iface.tx_bytes - prev_iface.tx_bytes) / (time_diff_s * 1024));
            }
          });
        } else if ( data.network && prev.network ) {
          out.net_rx_kb = Math.max(0, (data.network.rx_bytes - prev.network.rx_bytes) / (time_diff_s * 1024));
          out.net_tx_kb = Math.max(0, (data.network.tx_bytes - prev.network.tx_bytes) / (time_diff_s * 1024));
        }
      }
    }

    // Memory
    if ( data.memory ) {
      if ( data.memory.usage ) {
        out.mem_used_mb = Math.round(data.memory.usage / 1048576);
      } else {
        out.mem_used_mb = 0;
      }

      if ( data.memory.limit ) {
        out.mem_total_mb = Math.round(data.memory.limit / 1048576);
      }
    }

    // Convert any NaNs to 0 in case time_diff is 0
    Object.keys(out).forEach((key) => {
      if ( typeof out[key] === 'number' && isNaN(out[key]) ) {
        out[key] = 0;
      }
    });

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

  if ( ms >= 500 ) {
    return ts - ms + 1000;
  } else {
    return ts - ms;
  }
}

function toPercent(decimal, max = 100) {
  var percent = Math.max(0, Math.round(decimal * 10000) / 100);

  if ( max ) {
    return Math.min(percent, max);
  } else {
    return percent;
  }
}
