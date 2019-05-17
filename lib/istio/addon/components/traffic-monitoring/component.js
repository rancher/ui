import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import {
  get, set, observer, setProperties, computed
} from '@ember/object';
import C from 'ui/utils/constants';

const DURATION = [60, 300, 600, 1800, 3600, 10800, 21600]

export default Component.extend({
  scope:       service(),
  globalStore: service(),
  prefs:       service(),

  classNames:  ['istio-graph'],
  layout,

  loading:         false,
  durationContent: null,
  namespaces:      null,

  init() {
    this._super(...arguments);

    let defaultDuration = DURATION[1];
    const periodPref = get(this, `prefs.${ C.PREFS.ISTIO_PERIOD }`);

    if ( periodPref ) {
      defaultDuration = periodPref;
    }

    setProperties(this, {
      duration:        defaultDuration,
      namespace:       get(this, 'namespaces.firstObject.id'),
      durationContent: DURATION.map((d) => ({
        label: `istio.trafficMonitoring.duration.${ d }`,
        value: `${ d }`
      }))
    });

    this.fetchData();
  },

  actions: {
    refresh() {
      this.fetchData();
    },
  },

  namespaceDidChange: observer('namespace', function() {
    set(this, 'forceFit', true);
    this.fetchData();
  }),

  durationDidChange: observer('duration',  function() {
    set(this, `prefs.${ C.PREFS.ISTIO_PERIOD }`, get(this, 'duration'));
    set(this, 'forceFit', true);
    this.fetchData();
  }),

  graphData: computed('elements.[]', function() {
    return this.decorateGraphData(get(this, 'elements'))
  }),

  fetchData() {
    set(this, 'loading', true);
    let url = `/k8s/clusters/${ get(this, 'scope.currentCluster.id') }/api/v1/namespaces/istio-system/services/http:kiali-http:80/proxy/api/namespaces`
    const queryParams = `/graph?duration=${ get(this, 'duration') }s&graphType=versionedApp&injectServiceNodes=true&groupBy=app&appenders=deadNode,sidecarsCheck,serviceEntry,istio`

    url += `${ queryParams  }&namespaces=${ get(this, 'namespace') }`
    get(this, 'globalStore')
      .rawRequest({
        url,
        method:  'GET',
        headers: { 'X-Auth-Type-Kiali-UI': '1' },
      })
      .then((res) => {
        const { body = {} } = res

        if (this.isDestroyed || this.isDestroying) {
          return;
        }
        set(this, 'elements', body.elements)
      })
      .finally(() => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }
        set(this, 'loading', false);
      })
  },

  decorateGraphData(graphData) {
    const elementsDefaults = {
      edges: {
        grpc:           'NaN',
        grpcErr:        'NaN',
        grpcPercentErr: 'NaN',
        grpcPercentReq: 'NaN',
        http:           'NaN',
        http3xx:        'NaN',
        http4xx:        'NaN',
        http5xx:        'NaN',
        httpPercentErr: 'NaN',
        httpPercentReq: 'NaN',
        isMTLS:         undefined,
        protocol:       undefined,
        responseTime:   'NaN',
        tcp:            'NaN'
      },
      nodes: {
        app:             undefined,
        destServices:    undefined,
        grpcIn:          'NaN',
        grpcInErr:       'NaN',
        grpcOut:         'NaN',
        hasCB:           undefined,
        hasMissingSC:    undefined,
        hasVS:           undefined,
        httpIn:          'NaN',
        httpIn3xx:       'NaN',
        httpIn4xx:       'NaN',
        httpIn5xx:       'NaN',
        httpOut:         'NaN',
        isDead:          undefined,
        isGroup:         undefined,
        isInaccessible:  undefined,
        isMisconfigured: undefined,
        isOutside:       undefined,
        isRoot:          undefined,
        isServiceEntry:  undefined,
        isUnused:        undefined,
        service:         undefined,
        tcpIn:           'NaN',
        tcpOut:          'NaN',
        version:         undefined,
        workload:        undefined
      }
    };

    const decoratedGraph = {}

    if (graphData) {
      if (graphData.nodes) {
        decoratedGraph.nodes = graphData.nodes.map((node) => {
          const decoratedNode = { ...node };

          if (decoratedNode.data.traffic) {
            const traffic = decoratedNode.data.traffic;

            decoratedNode.data.traffic = undefined;
            traffic.map((protocol) => {
              decoratedNode.data = {
                ...protocol.rates,
                ...decoratedNode.data
              };
            });
          }

          decoratedNode.data = {
            ...elementsDefaults.nodes,
            ...decoratedNode.data
          };

          return decoratedNode;
        });
      }
      if (graphData.edges) {
        decoratedGraph.edges = graphData.edges.map((edge) => {
          const decoratedEdge = { ...edge };
          const { traffic, ...edgeData } = edge.data;

          if (traffic && traffic.protocol !== '') {
            decoratedEdge.data = {
              protocol: traffic.protocol,
              ...traffic.rates,
              ...edgeData
            };
          }

          decoratedEdge.data = {
            ...elementsDefaults.edges,
            ...decoratedEdge.data
          };

          return decoratedEdge;
        });
      }
    }

    return decoratedGraph;
  },
});
