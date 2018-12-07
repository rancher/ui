import Mixin from '@ember/object/mixin';
import { get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
const SINGLE_METRICS = ['etcd-leader-change', 'etcd-server-leader-sum', 'etcd-server-failed-proposal', 'ingresscontroller-upstream-response-seconds'];
const GRAPHS = {
  'apiserver-request-count': {
    'priority': 301,
    'unit':     'number'
  },
  'apiserver-request-latency': {
    'priority': 300,
    'unit':     'ms'
  },
  'cluster-cpu-load': {
    'priority': 101,
    'unit':     'number'
  },
  'cluster-cpu-usage': {
    'priority': 100,
    'unit':     'percent'
  },
  'cluster-disk-io': {
    'priority': 104,
    'unit':     'kbps'
  },
  'cluster-fs-usage-percent': {
    'priority': 103,
    'unit':     'percent'
  },
  'cluster-memory-usage': {
    'priority': 102,
    'unit':     'percent'
  },
  'cluster-network-io': {
    'priority': 106,
    'unit':     'kbps'
  },
  'cluster-network-packet': {
    'priority': 105,
    'unit':     'pps'
  },
  'controllermanager-queue-depth': {
    'priority': 310,
    'unit':     'number'
  },
  'etcd-db-bytes-sum': {
    'priority': 204,
    'unit':     'byte'
  },
  'etcd-disk-operate': {
    'priority': 209,
    'unit':     'seconds'
  },
  'etcd-grpc-client': {
    'priority': 203,
    'unit':     'kbps'
  },
  'etcd-leader-change': {
    'priority': 202,
    'unit':     'number'
  },
  'etcd-peer-traffic': {
    'priority': 206,
    'unit':     'kbps'
  },
  'etcd-raft-proposals': {
    'priority': 207,
    'unit':     'number'
  },
  'etcd-rpc-rate': {
    'priority': 208,
    'unit':     'ops'
  },
  'etcd-server-failed-proposal': {
    'priority': 201,
    'unit':     'number'
  },
  'etcd-server-leader-sum': {
    'priority': 200,
    'unit':     'number'
  },
  'etcd-stream': {
    'priority': 205,
    'unit':     'number'
  },
  'etcd-sync-duration': {
    'priority': 209,
    'unit':     'seconds'
  },
  'fluentd-buffer-queue-length': {
    'priority': 300,
    'unit':     'number'
  },
  'fluentd-input-record-number': {
    'priority': 301,
    'unit':     'number'
  },
  'fluentd-output-errors': {
    'priority': 302,
    'unit':     'number'
  },
  'fluentd-output-record-number': {
    'priority': 303,
    'unit':     'number'
  },
  'ingresscontroller-nginx-connection': {
    'priority': 330,
    'unit':     'number'
  },
  'ingresscontroller-request-process-time': {
    'priority': 331,
    'unit':     'seconds'
  },
  'ingresscontroller-upstream-response-seconds': {
    'priority': 332,
    'unit':     'seconds'
  },
  'node-cpu-load': {
    'priority': 501,
    'unit':     'number'
  },
  'node-cpu-usage': {
    'priority': 500,
    'unit':     'percent'
  },
  'node-disk-io': {
    'priority': 504,
    'unit':     'kbps'
  },
  'node-fs-usage-percent': {
    'priority': 503,
    'unit':     'percent'
  },
  'node-memory-usage': {
    'priority': 502,
    'unit':     'percent'
  },
  'node-network-io': {
    'priority': 506,
    'unit':     'kbps'
  },
  'node-network-packet': {
    'priority': 505,
    'unit':     'pps'
  },
  'scheduler-e-2-e-scheduling-latency-seconds-quantile': {
    'priority': 320,
    'unit':     'seconds'
  },
  'scheduler-pod-unscheduler': {
    'priority': 322,
    'unit':     'number'
  },
  'scheduler-total-preemption-attempts': {
    'priority': 321,
    'unit':     'number'
  },
  'container-cpu-usage': {
    'priority': 800,
    'unit':     'mcpu'
  },
  'container-disk-io': {
    'priority': 804,
    'unit':     'kbps'
  },
  'container-memory-usage-bytes-sum': {
    'priority': 801,
    'unit':     'byte'
  },
  'container-network-io': {
    'priority': 803,
    'unit':     'kbps'
  },
  'container-network-packet': {
    'priority': 802,
    'unit':     'pps'
  },
  'pod-cpu-usage': {
    'priority': 700,
    'unit':     'mcpu'
  },
  'pod-disk-io': {
    'priority': 704,
    'unit':     'kbps'
  },
  'pod-memory-usage-bytes-sum': {
    'priority': 701,
    'unit':     'byte'
  },
  'pod-network-io': {
    'priority': 703,
    'unit':     'kbps'
  },
  'pod-network-packet': {
    'priority': 702,
    'unit':     'pps'
  },
  'workload-cpu-usage': {
    'priority': 600,
    'unit':     'mcpu'
  },
  'workload-disk-io': {
    'priority': 604,
    'unit':     'kbps'
  },
  'workload-memory-usage-bytes-sum': {
    'priority': 601,
    'unit':     'byte'
  },
  'workload-network-io': {
    'priority': 603,
    'unit':     'kbps'
  },
  'workload-network-packet': {
    'priority': 602,
    'unit':     'pps'
  }
}


export default Mixin.create({
  globalStore: service(),
  scope:       service(),
  growl:       service(),

  filters:       null,
  graphs:        null,
  state:         null,
  projectScope:  false,
  metricParams:  null,
  timeOutAnchor: null,

  init() {
    this._super(...arguments);

    set(this, 'state', {
      loading:  false,
      detail:   true,
      noGraphs: false,
      isCustom: false,
      from:     null,
      to:       null,
      interval: null,
    })
  },

  willDestroyElement() {
    this.clearTimeOut();
    this._super();
  },

  updateData(out) {
    const single = [];
    const graphs = [];

    out.sortBy('graph.priority').forEach((item) => {
      if ( SINGLE_METRICS.indexOf(get(item, 'graph.title')) > -1 ) {
        single.push(item);
      } else if ((get(item, 'series') || []).find((serie) => get(serie, 'points.length') > 1)){
        graphs.push(item);
      }
    })

    setProperties(this, {
      'state.noGraphs': get(graphs, 'length') === 0,
      graphs,
      single
    });

    if ( !get(this, 'state.isCustom') ) {
      const interval = get(this, 'state.interval');

      let timeout = parseInt(interval.substr(0, get(interval, 'length') - 1), 10);

      timeout = timeout > 5 ? timeout : 5;
      const timeOutAnchor = setTimeout(() => {
        this.send('query', false);
      }, timeout * 1000);

      set(this, 'timeOutAnchor', timeOutAnchor);
    }
  },

  clearTimeOut() {
    const timeOutAnchor = get(this, 'timeOutAnchor');

    if (timeOutAnchor){
      clearTimeout(timeOutAnchor);
      set(this, 'timeOutAnchor', timeOutAnchor);
    }
  },

  actions: {
    query(showLoading = true){
      this.clearTimeOut();
      const gs = get(this, 'globalStore');

      if ( showLoading ) {
        set(this, 'state.loading', true);
      }

      let metricParams = {};

      if ( get(this, 'resourceId') ) {
        if ( get(this, 'metricParams') ) {
          metricParams = get(this, 'metricParams');
        } else {
          set(metricParams, 'instance', get(this, 'resourceId'));
        }
      }

      let url;

      if ( get(this, 'projectScope') ) {
        url = '/v3/projectmonitorgraphs?action=query';
      } else {
        url = '/v3/clustermonitorgraphs?action=query';
      }

      const filters = get(this, 'filters') || {};

      const cluster = get(this, 'scope.currentCluster.id');
      const project = get(this, 'scope.currentProject.id');

      if ( project ) {
        set(filters, 'projectId', project);
      } else if (cluster) {
        set(filters, 'clusterId', cluster);
      }

      gs.rawRequest({
        url,
        method: 'POST',
        data:   {
          filters,
          metricParams,
          interval:  get(this, 'state.interval'),
          isDetails: get(this, 'state.detail'),
          from:      get(this, 'state.from'),
          to:        get(this, 'state.to'),
        }
      }).then((metrics) => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        const metricsBody = get(JSON.parse(get(metrics, 'body')) || {}, 'data') || [];
        const out = metricsBody.map((metric) => {
          const title = get(metric, 'graphID').split(':')[1];
          const graph = GRAPHS[title];

          if ( graph ) {
            set(graph, 'title', title);
          }

          return {
            graph,
            series: (get(metric, 'series') || []).sortBy('name')
          }
        })

        this.updateData(out);
      }).catch((err) => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        setProperties(this, {
          'state.noGraphs': true,
          graphs:           [],
          single:           []
        });
        get(this, 'growl').fromError(get(err, 'body.message') || get(err, 'message') || err);
      }).finally(() => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        if ( showLoading ) {
          set(this, 'state.loading', false);
        }
      });
    }
  }
});
