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

import Mixin from '@ember/object/mixin';
import Kiali from 'ui/utils/kiali';

const NodeColorBorder = Kiali.PfColors.Black400;
const NodeBorderWidth = '1px';
const NodeTextColor = Kiali.PfColors.Black;
const EdgeTextFont = 'rancher-icons,Verdana,Arial,Helvetica,sans-serif,FontAwesome,PatternFlyIcons-webfont';
const NodeTextFont = EdgeTextFont;
const NodeTextFontWeight = 'normal';
const NodeTextFontWeightBadged = 'normal';
const NodeTextFontSize = '8px';
const NodeTextFontSizeHover = '11px';
const NodeColorFillHover = Kiali.PfColors.Blue50;
const NodeColorFillHoverDegraded = '#fdf2e5';
const NodeColorFillHoverFailure = '#ffe6e6';
const NodeColorBorderHover = Kiali.PfColors.Blue300;
const NodeColorFill = Kiali.PfColors.White;
const NodeColorBorderDegraded = Kiali.PfColors.Orange;
const NodeColorBorderFailure = Kiali.PfColors.Red;
const NodeTextColorBadged = Kiali.PfColors.Purple600;
const NodeHeight = '10px';
const NodeWidth = NodeHeight;
const NodeTextOutlineColor = Kiali.PfColors.White;
const NodeTextOutlineWidth = '1px';
const NodeColorFillBox = Kiali.PfColors.Black100;
const EdgeTextFontSize = '6px';
const EdgeColor = Kiali.PfColors.Green400;
const EdgeColorDead = Kiali.PfColors.Black500;
const EdgeColorDegraded = Kiali.PfColors.Orange;
const EdgeColorFailure = Kiali.PfColors.Red;
const EdgeWidth = 1;
const EdgeTextOutlineColor = Kiali.PfColors.White;
const EdgeTextOutlineWidth = '1px';
const DimClass = 'mousedim';
const EdgeTextFontSizeHover = '10px';
const NodeBorderWidthSelected = '3px';
const NodeColorBorderSelected = Kiali.PfColors.Blue300;
const EdgeWidthSelected = 3;

export default Mixin.create({
  getStyles() {
    const nodeSelectedStyle = {
      'border-color': (ele) => {
        if (ele.hasClass(Kiali.DEGRADED.name)) {
          return NodeColorBorderDegraded;
        }
        if (ele.hasClass(Kiali.FAILURE.name)) {
          return NodeColorBorderFailure;
        }

        return NodeColorBorderSelected;
      },
      'border-width': NodeBorderWidthSelected
    };

    return [{
      selector: 'node',
      css:      {
        'background-color': NodeColorFill,
        'background-image': (ele) => {
          return this.getNodeBackgroundImage(ele);
        },
        'background-fit': 'contain',
        'border-color':   (ele) => {
          return this.getNodeBorderColor(ele);
        },
        'border-style': (ele) => {
          return ele.data('isUnused') ? 'dotted' : 'solid';
        },
        'border-width': NodeBorderWidth,
        color:          (ele) => {
          return this.isNodeBadged(ele) ? NodeTextColorBadged : NodeTextColor;
        },
        'font-family': NodeTextFont,
        'font-size':   NodeTextFontSize,
        'font-weight': (ele) => {
          return this.isNodeBadged(ele) ? NodeTextFontWeightBadged : NodeTextFontWeight;
        },
        height: NodeHeight,
        width:  NodeWidth,
        label:  (ele) => {
          return this.getNodeLabel(ele);
        },
        shape: (ele) => {
          return this.getNodeShape(ele);
        },
        'text-outline-color': NodeTextOutlineColor,
        'text-outline-width': NodeTextOutlineWidth,
        'text-halign':        'center',
        'text-margin-y':      '-1px',
        'text-valign':        'top',
        'text-wrap':          'wrap',
        'z-index':            '10',
      }
    }, {
      selector: 'node:selected',
      style:    nodeSelectedStyle
    }, {
      // version group
      selector: '$node > node',
      css:      {
        'text-valign':      'top',
        'text-halign':      'right',
        'text-margin-x':    '2px',
        'text-margin-y':    '8px',
        'text-rotation':    '90deg',
        'background-color': NodeColorFillBox,
      }
    }, {
      selector: 'edge',
      style:    {
        'curve-style': 'bezier',
        'font-family': EdgeTextFont,
        'font-size':   EdgeTextFontSize,
        label:         (ele) => {
          return this.getEdgeLabel(ele);
        },
        'line-color': (ele) => {
          return this.getEdgeColor(ele);
        },
        'line-style':         'solid',
        'width':              EdgeWidth,
        'target-arrow-shape': 'vee',
        'target-arrow-color': (ele) => {
          return this.getEdgeColor(ele);
        },
        'text-outline-color': EdgeTextOutlineColor,
        'text-outline-width': EdgeTextOutlineWidth,
      }
    }, {
      selector: 'edge[tcpSentRate]',
      css:      {
        'target-arrow-shape': 'triangle-cross',
        'line-color':         Kiali.PfColors.Blue600,
        'target-arrow-color': Kiali.PfColors.Blue600
      }
    }, {
      selector: 'edge:selected',
      css:      { width: EdgeWidthSelected },
    }, {
      selector: 'node.mousehighlight',
      style:    {
        'background-color': (ele) => {
          if (ele.hasClass(Kiali.DEGRADED.name)) {
            return NodeColorFillHoverDegraded;
          }
          if (ele.hasClass(Kiali.FAILURE.name)) {
            return NodeColorFillHoverFailure;
          }

          return NodeColorFillHover;
        },
        'border-color': (ele) => {
          if (ele.hasClass(Kiali.DEGRADED.name)) {
            return NodeColorBorderDegraded;
          }
          if (ele.hasClass(Kiali.FAILURE.name)) {
            return NodeColorBorderFailure;
          }

          return NodeColorBorderHover;
        },
        'font-size': NodeTextFontSizeHover
      }
    }, {
      selector: 'edge.mousehighlight',
      style:    { 'font-size': EdgeTextFontSizeHover }
    }, {
      selector: `node.${  DimClass }`,
      style:    { opacity: '0.6' }
    }, {
      selector: `edge.${  DimClass }`,
      style:    { opacity: '0.3' }
    }]
  },

  getNodeBorderColor(ele) {
    if (ele.hasClass(Kiali.DEGRADED.name)) {
      return NodeColorBorderDegraded;
    }
    if (ele.hasClass(Kiali.FAILURE.name)) {
      return NodeColorBorderFailure;
    }

    return NodeColorBorder;
  },

  getNodeBackgroundImage(ele) {
    const isOutside = ele.data('isOutside');
    const isGroup = ele.data('isGroup');
    const isInaccessible = ele.data('isInaccessible');

    if (isOutside && !isGroup) {
      if (isInaccessible) {
        return Kiali.NodeImageOutLocked;
      } else {
        return Kiali.NodeImageOut;
      }
    }

    return 'none';
  },

  isNodeBadged(ele) {
    const cyGlobal = this.getCyGlobalData(ele);

    if (cyGlobal.showMissingSidecars && ele.data('hasMissingSC')) {
      return true;
    }
    if (cyGlobal.showCircuitBreakers && ele.data('hasCB')) {
      return true;
    }

    return cyGlobal.showVirtualServices && ele.data('hasVS');
  },

  getCyGlobalData(ele) {
    return ele.cy().scratch(Kiali.CytoscapeGlobalScratchNamespace);
  },

  getNodeLabel(ele) {
    const nodeType = ele.data('nodeType');
    const namespace = ele.data('namespace');
    const app = ele.data('app');
    const version = ele.data('version');
    const workload = ele.data('workload');
    const service = ele.data('service');
    const cyGlobal = this.getCyGlobalData(ele);
    const isGroupMember = ele.data('parent');
    let content = '';

    if (this.getCyGlobalData(ele).showNodeLabels) {
      if (isGroupMember) {
        switch (nodeType) {
        case Kiali.NodeType.APP:
          if (cyGlobal.graphType === Kiali.GraphType.APP) {
            content = app;
          } else if (version && version !== 'unknown') {
            content = version;
          } else {
            content = workload ? `${ workload }` : `${ app }`;
          }
          break;
        case Kiali.NodeType.SERVICE:
          content = service;
          break;
        case Kiali.NodeType.WORKLOAD:
          content = workload;
          break;
        default:
          content = '';
        }
      } else {
        switch (nodeType) {
        case Kiali.NodeType.APP:
          if (cyGlobal.graphType === Kiali.GraphType.APP || ele.data('isGroup') || version === 'unknown') {
            content = app;
          } else {
            content = `${ app  }\n${ version }`;
          }
          break;
        case Kiali.NodeType.SERVICE:
          content = service;
          break;
        case Kiali.NodeType.UNKNOWN:
          content = 'unknown';
          break;
        case Kiali.NodeType.WORKLOAD:
          content = workload;
          break;
        default:
          content = 'error';
        }

        if (ele.data('isOutside')) {
          content += `\n${ namespace }`;
        }
      }
    }

    let badges = '';

    if (cyGlobal.showMissingSidecars && ele.data('hasMissingSC')) {
      badges = Kiali.NodeIconMS + badges;
    }
    if (cyGlobal.showCircuitBreakers && ele.data('hasCB')) {
      badges = Kiali.NodeIconCB + badges;
    }
    if (cyGlobal.showVirtualServices && ele.data('hasVS')) {
      badges = Kiali.NodeIconVS + badges;
    }

    return badges + content;
  },

  getNodeShape(ele) {
    const nodeType = ele.data('nodeType');

    switch (nodeType) {
    case Kiali.NodeType.APP:
      return 'square';
    case Kiali.NodeType.SERVICE:
      return 'triangle';
    case Kiali.NodeType.UNKNOWN:
      return 'diamond';
    case Kiali.NodeType.WORKLOAD:
      return 'ellipse';
    default:
      return 'ellipse';
    }
  },

  getEdgeLabel(ele) {
    const cyGlobal = this.getCyGlobalData(ele);
    const edgeLabelMode = cyGlobal.edgeLabelMode;
    let content = '';

    switch (edgeLabelMode) {
    case Kiali.EdgeLabelMode.TRAFFIC_RATE_PER_SECOND: {
      if (ele.data('rate')) {
        const rate = Number(ele.data('rate'));

        if (rate > 0) {
          const pErr = ele.data('percentErr') ? Number(ele.data('percentErr')) : 0;

          content = pErr > 0 ? `${ rate.toFixed(2)  }, ${  pErr.toFixed(1)  }%` : rate.toFixed(2);
        }
      } else if (ele.data('tcpSentRate')) {
        const rate = Number(ele.data('tcpSentRate'));

        if (rate > 0) {
          content = `${ rate.toFixed(2) }`;
        }
      }
      break;
    }
    case Kiali.EdgeLabelMode.RESPONSE_TIME_95TH_PERCENTILE: {
      const responseTime = ele.data('responseTime') ? Number(ele.data('responseTime')) : 0;

      if (responseTime > 0) {
        content = responseTime < 1.0 ? `${ (responseTime * 1000).toFixed(0)  }ms` : `${ responseTime.toFixed(2)  }s`;
      }
      break;
    }
    case Kiali.EdgeLabelMode.REQUESTS_PERCENT_OF_TOTAL: {
      const percentRate = ele.data('percentRate') ? Number(ele.data('percentRate')) : 0;

      content = percentRate > 0 ? `${ percentRate.toFixed(0)  }%` : '';
      break;
    }
    default:
      content = '';
    }

    return content;
  },

  getEdgeColor(ele) {
    let rate = 0;
    let pErr = 0;

    if (ele.data(Kiali.CyEdge.http) > 0) {
      rate = Number(ele.data(Kiali.CyEdge.http));
      pErr = ele.data(Kiali.CyEdge.httpPercentErr) > 0 ? Number(ele.data(Kiali.CyEdge.httpPercentErr)) : 0;
    } else if (ele.data(Kiali.CyEdge.grpc) > 0) {
      rate = Number(ele.data(Kiali.CyEdge.grpc));
      pErr = ele.data(Kiali.CyEdge.grpcPercentErr) > 0 ? Number(ele.data(Kiali.CyEdge.grpcPercentErr)) : 0;
    }

    if (rate === 0) {
      return EdgeColorDead;
    }

    if (pErr > Kiali.REQUESTS_THRESHOLDS.failure) {
      return EdgeColorFailure;
    }
    if (pErr > Kiali.REQUESTS_THRESHOLDS.degraded) {
      return EdgeColorDegraded;
    }

    return EdgeColor;
  },
})
