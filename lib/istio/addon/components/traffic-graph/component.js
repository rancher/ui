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

import { get, set, observer } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
import cytoscape from 'cytoscape';
import Kiali from 'ui/utils/kiali';
import Hightlighter from 'istio/mixins/graph-hightlighter';
import GraphStyles from 'istio/mixins/graph-styles';
import { assign } from '@ember/polyfills';
import GroupCompoundLayout from 'ui/utils/group-compound-layout';
import TrafficRender from 'ui/utils/traffic-renderer';
import ThrottledResize from 'shared/mixins/throttled-resize';
import $ from 'jquery';
import cytoscapeDagre from 'rancher-cytoscape-dagre';

cytoscape.use(cytoscapeDagre);
cytoscape('layout', 'group-compound-layout', GroupCompoundLayout);

export default Component.extend(Hightlighter, GraphStyles, ThrottledResize, {
  layout,

  didInsertElement() {
    const cy = cytoscape({
      container:           $('#cy'),
      style:               this.getStyles(),
      boxSelectionEnabled: false,
      userZoomingEnabled:  false,
      wheelSensitivity:    0.1,
      autounselectify:     false,
      autoungrabify:       true,
    });

    set(this, 'cy', cy)

    this.cyInitialization(cy)
  },

  willDestroyElement() {
    const { cy } = this

    if (cy) {
      cy.destroy()
      set(this, 'cy', null)
    }
  },

  elementsChange: observer('elements', function() {
    const { cy } = this
    let updateLayout = false
    const { prevElements, elements } = this

    if (prevElements) {
      updateLayout = this.elementsNeedRelayout(prevElements, elements)
    }

    set(this, 'prevElements', get(this, 'elements'))
    this.processGraphUpdate(cy, updateLayout)
  }),

  processGraphUpdate(cy, updateLayout) {
    if (!cy) {
      return;
    }

    get(this, 'trafficRenderer').stop()

    const globalScratchData = {
      graphType:           get(this, 'graphType'),
      edgeLabelMode:       get(this, 'edgeLabelMode'),
      showCircuitBreakers: get(this, 'showCircuitBreakers'),
      showMissingSidecars: get(this, 'showMissingSidecars'),
      showNodeLabels:      get(this, 'showNodeLabels'),
      showSecurity:        get(this, 'showSecurity'),
      showVirtualServices: get(this, 'showVirtualServices'),
    }

    cy.scratch(Kiali.CytoscapeGlobalScratchNamespace, globalScratchData);

    cy.startBatch();

    if (updateLayout) {
      cy.nodes().positions({
        x: 0,
        y: 0
      });
    }

    cy.json({ elements: get(this, 'elements'), });

    const layoutOptions = {
      name:                        'dagre',
      fit:                         false,
      nodeDimensionsIncludeLabels: true,
      rankDir:                     'LR'
    }

    if (updateLayout) {
      if (cy.nodes('$node > node').length > 0) {
        assign(layoutOptions, {
          name:       'group-compound-layout',
          realLayout: 'dagre'
        })
      }
      cy.layout(layoutOptions).run();
    }

    cy.endBatch();

    if (updateLayout) {
      this.safeFit(cy);
    }
  },

  safeFit(cy) {
    if (!cy) {
      return;
    }

    cy.fit('', Kiali.ZoomOptions.fitPadding);
    if (cy.zoom() > 2.5) {
      cy.zoom(2.5);
      cy.center();
    }
  },

  cyInitialization(cy) {
    if (!cy) {
      return;
    }

    set(this, 'trafficRenderer', TrafficRender.create({
      cy,
      edges: cy.edges(),
    }))

    cy.on('tap', (event) => {
      const cytoscapeEvent = this.getCytoscapeBaseEvent(event, cy);

      if (cytoscapeEvent) {
        this.handleTap(cytoscapeEvent);
        this.selectTarget(event.target);
      }
    });

    cy.on('mouseover', 'node,edge', (evt) => {
      const cytoscapeEvent = this.getCytoscapeBaseEvent(evt, cy);

      if (cytoscapeEvent) {
        this.handleMouseIn(cytoscapeEvent);
      }
    });

    cy.on('mouseout', 'node,edge', (evt) => {
      const cytoscapeEvent = this.getCytoscapeBaseEvent(evt, cy);

      if (cytoscapeEvent) {
        this.handleMouseOut(cytoscapeEvent);
      }
    });

    cy.ready(() => {
      this.processGraphUpdate(cy, true);
    });

    cy.on('destroy', () => {
      get(this, 'trafficRenderer').stop();
      set(this, 'cy', undefined)
    });
  },

  getCytoscapeBaseEvent(event, cy) {
    const target = event.target;

    if (target === cy) {
      return {
        summaryType:   'graph',
        summaryTarget: cy
      };
    } else if (target.isNode()) {
      if (target.data('isGroup') === 'version') {
        return {
          summaryType:   'group',
          summaryTarget: target
        };
      } else {
        return {
          summaryType:   'node',
          summaryTarget: target
        };
      }
    } else if (target.isEdge()) {
      return {
        summaryType:   'edge',
        summaryTarget: target
      };
    } else {
      return null;
    }
  },

  handleMouseIn(event) {
    this.onMouseIn(event);
  },

  handleMouseOut(event) {
    this.onMouseOut(event)
  },

  handleTap(event) {
    this.onClick(event);
  },

  selectTarget(target) {
    const { cy } = this

    if (!target) {
      target = cy;
    }
    cy.$(':selected')
      .selectify()
      .unselect()
      .unselectify();
    if (target !== cy) {
      target.selectify()
        .select()
        .unselectify();
    }
  },

  onResize() {
    this._super(...arguments);
    this.safeFit(get(this, 'cy'));
  },

  elementsNeedRelayout(prevElements, nextElements) {
    if (prevElements === nextElements) {
      return false;
    }
    if (
      !prevElements ||
      !nextElements ||
      !prevElements.nodes ||
      !prevElements.edges ||
      !nextElements.nodes ||
      !nextElements.edges ||
      prevElements.nodes.length !== nextElements.nodes.length ||
      prevElements.edges.length !== nextElements.edges.length
    ) {
      return true;
    }

    // If both have the same ids, we don't need to relayout
    return !(
      this.nodeOrEdgeArrayHasSameIds(nextElements.nodes, prevElements.nodes) &&
      this.nodeOrEdgeArrayHasSameIds(nextElements.edges, prevElements.edges)
    );
  },

  nodeOrEdgeArrayHasSameIds(a, b) {
    const aIds = a.map((e) => e.id).sort();

    return b
      .map((e) => e.id)
      .sort()
      .every((eId, index) => eId === aIds[index]);
  }
});
