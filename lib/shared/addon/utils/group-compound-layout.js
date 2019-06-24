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

const NAMESPACE_KEY = 'group_compound_layout';
const CHILDREN_KEY = 'children';
const STYLES_KEY = 'styles';
const RELATIVE_POSITION_KEY = `${ NAMESPACE_KEY  }relative_position`;
const COMPOUND_PARENT_NODE_CLASS = '__compoundLayoutParentNodeClass';

/**
 * Synthetic edge generator takes care of creating edges without repeating the same edge (targetA -> targetB) twice
 */
class SyntheticEdgeGenerator {
  constructor() {
    this.nextId = 0;
    this.generatedMap = {};
  }

  getEdge(source, target) {
    const sourceId = this.normalizeToParent(source).id();
    const targetId = this.normalizeToParent(target).id();
    const key = `${ sourceId }->${ targetId }`;

    if (this.generatedMap[key]) {
      return false;
    }

    this.generatedMap[key] = true;

    return {
      group: 'edges',
      data:  {
        id:     `synthetic-edge-${  this.nextId++ }`,
        source: sourceId,
        target: targetId
      }
    };
  }

  // Returns the parent if any or the element itself.
  normalizeToParent(element) {
    return element.isChild() ? element.parent() : element;
  }
}

export default class GroupCompoundLayout {
  constructor(options) {
    this.options = options;
    this.cy = this.options.cy;
    this.elements = this.options.eles;
    this.syntheticEdgeGenerator = new SyntheticEdgeGenerator();
  }

  /**
   * This code gets executed on the cy.layout(...).run() is our entrypoint of this algorithm.
   */
  run() {
    const { realLayout } = this.options;
    const parents = this.parents();

    const compoundLayoutOptions = {
      fit:                         false,
      name:                        'dagre',
      nodeDimensionsIncludeLabels: true,
      rankDir:                     'LR',
    }

    // (1.a) Prepare parents by assigning a size
    parents.each((parent) => {
      const children = parent.children();
      const targetElements = children.add(children.edgesTo(children));

      const compoundLayout = targetElements.layout(compoundLayoutOptions);

      compoundLayout.on('layoutstart layoutready layoutstop', () => {
        return false;
      });
      compoundLayout.run();

      const boundingBox = targetElements.boundingBox();
      const parentPosition = this.positionFromBoundingBox(boundingBox);

      parent.children().each((child) => {
        const childPosition = this.positionFromBoundingBox(child.boundingBox());
        const relativePosition = {
          x: childPosition.x - parentPosition.x,
          y: childPosition.y - parentPosition.y
        };

        child.data(RELATIVE_POSITION_KEY, relativePosition);
      });

      const backupStyles = {
        shape:  parent.style('shape'),
        height: parent.style('height'),
        width:  parent.style('width')
      };

      const newStyles = {
        shape:  'rectangle',
        height: `${ boundingBox.h }px`,
        width:  `${ boundingBox.w }px`
      };

      // Saves a backup of current styles to restore them after we finish
      this.setScratch(parent, STYLES_KEY, backupStyles);
      parent.addClass(COMPOUND_PARENT_NODE_CLASS);
      // (1.b) Set the size
      parent.style(newStyles);
      // Save the children as jsons in the parent scratchpad for later
      this.setScratch(parent, CHILDREN_KEY, parent.children().jsons());
    });

    //  Remove the children and its edges and add synthetic edges for every edge that touches a child node.
    let syntheticEdges = this.cy.collection();
    // Removed elements are being stored because later we will add them back.
    const elementsToRemove = parents.children().reduce((children, child) => {
      children.push(child);

      return children.concat(
        child.connectedEdges().reduce((edges, edge) => {
          // (1.c) Create synthetic edges.
          const syntheticEdge = this.syntheticEdgeGenerator.getEdge(edge.source(), edge.target());

          if (syntheticEdge) {
            syntheticEdges = syntheticEdges.add(this.cy.add(syntheticEdge));
          }
          edges.push(edge);

          return edges;
        }, [])
      );
    }, []);

    // (1.d) Remove children and edges that touch a child node.
    this.cy.remove(this.cy.collection().add(elementsToRemove));

    let payload = this.options

    Object.assign(payload, {
      name:       realLayout, // but using the real layout
      eles:       this.cy.elements(), // and the current elements
      realLayout: undefined // We don't want this realLayout stuff in there.
    })

    const layout = this.cy.layout(payload);

    // (2) Add a one-time callback to be fired when the layout stops
    layout.one('layoutstop', () => {
      // (3) Remove synthetic edges
      this.cy.remove(syntheticEdges);

      // Add and position the children nodes according to the layout
      parents.each((parent) => {
        // (4.a) Add back the children and the edges
        this.cy.add(this.getScratch(parent, CHILDREN_KEY));
        // (4.b) Layout the children using our compound layout.
        parent.children().each((child) => {
          const relativePosition = child.data(RELATIVE_POSITION_KEY);

          child.relativePosition(relativePosition);
          child.removeData(RELATIVE_POSITION_KEY);
        });

        parent.style(this.getScratch(parent, STYLES_KEY));
        parent.removeClass(COMPOUND_PARENT_NODE_CLASS);

        // Discard the saved values
        this.setScratch(parent, CHILDREN_KEY, undefined);
        this.setScratch(parent, STYLES_KEY, undefined);
      });
      // (4.a) Add the real edges, we already added the children nodes.
      this.cy.add(
        this.cy
          .collection()
          .add(elementsToRemove)
          .edges()
      );
    });
    layout.run();
  }

  parents() {
    return this.elements.nodes('$node > node');
  }

  getScratch(element, key) {
    return element.scratch(NAMESPACE_KEY + key);
  }

  setScratch(element, key, value) {
    element.scratch(NAMESPACE_KEY + key, value);
  }

  positionFromBoundingBox(boundingBox) {
    return {
      x: boundingBox.x1 + boundingBox.w * 0.5,
      y: boundingBox.y1 + boundingBox.h * 0.5
    };
  }
}
