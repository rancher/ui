/*
   Copyright 2019 Kiali

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import EmberObject from '@ember/object';
import { get, set } from '@ember/object'
import Kiali from 'ui/utils/kiali';

const FRAME_RATE = 1 / 60;

const TrafficEdgeType = {
  RPS:  'RPS',
  TCP:  'TCP',
  NONE: 'NONE',
}

const CyEdge = {
  grpc:           'grpc',
  grpcErr:        'grpcErr',
  grpcPercentErr: 'grpcPercentErr',
  grpcPercentReq: 'grpcPercentReq',
  http:           'http',
  http3xx:        'http3xx',
  http4xx:        'http4xx',
  http5xx:        'http5xx',
  httpPercentErr: 'httpPercentErr',
  httpPercentReq: 'httpPercentReq',
  id:             'id',
  isMTLS:         'isMTLS',
  protocol:       'protocol',
  responseTime:   'responseTime',
  tcp:            'tcp'
};

export default EmberObject.extend({
  stop() {
    const { animationTimer } = this

    if (animationTimer) {
      window.clearInterval(animationTimer);
      set(this, 'animationTimer', undefined)
      this.clear();
    }
  },

  start() {
    this.stop();
    set(this, 'animationTimer', window.setInterval(get(this, 'processStep'), FRAME_RATE * 1000))
  },

  setEdges(edges) {
    set(this, 'trafficEdges', this.processEdges(edges))
  },

  setEdge(edge) {
    set(this, 'edge', edge)
  },

  processEdges(edges) {
    return edges.reduce((trafficEdges, edge) => {
      const type = this.getTrafficEdgeType(edge);

      if (type !== TrafficEdgeType.NONE) {
        const edgeId = edge.data(CyEdge.id);

        if (edgeId in get(this, 'trafficEdges')) {
          trafficEdges[edgeId] = get(this, 'trafficEdges.edgeId');
        }
        trafficEdges[edgeId].setType(type);
      }

      return trafficEdges;
    }, {});
  },

  getTrafficEdgeType(edge) {
    switch (edge.data(CyEdge.protocol)) {
    case Kiali.Protocol.GRPC:
    case Kiali.Protocol.HTTP:
      return TrafficEdgeType.RPS;
    case Kiali.Protocol.TCP:
      return TrafficEdgeType.TCP;
    default:
      return TrafficEdgeType.NONE;
    }
  },
});
