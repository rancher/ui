import Ember from 'ember';
import ThrottledResize from 'ui/mixins/throttled-resize';

export default Ember.View.extend(ThrottledResize,{
  cy: null,
  cyElem: null,

  onResize: function() {
    var cy = this.get('cy');
    if ( cy )
    {
      setTimeout(function() {
        cy.fit(null, 20);
      },100);
    }
  },

  didInsertElement: function() {
    this._super();
    var elem = $('<div id="environment-graph"></div>').appendTo('BODY');
    this.set('cyElem', elem[0]);

    Ember.run.later(this,'graph',250);
  },

  updateGraph: function() {
    console.log('starting updateGraph');
    var cy = this.get('cy');
    cy.startBatch();

    var services = this.get('context.services');

    var relayout = false;
    var startNodes = cy.nodes().length;
    var startEdges = cy.edges().length;
    var expectedNodes = cy.collection();
    var expectedEdges = cy.collection();
    var unremovedServices = services.filter(function(service) {
      return ['removed','purging','purged'].indexOf(service.get('state')) === -1;
    });

    unremovedServices.forEach(function(service) {
      var serviceId = service.get('id');
      var node = cy.getElementById(serviceId)[0];
      if ( !node )
      {
        relayout = true;
        node = cy.add({
          group: 'nodes',
          data: {
            id: serviceId,
            shape: 'ellipse',
          },
          position: {x: 0, y: 0}
        })[0];
      }
      node.data({
        name: service.get('name'),
        color: (service.get('state') === 'active' ? '#41c77d' : (service.get('state') === 'inactive' ? '#f00' : '#f3bd24')),
      });

     expectedNodes = expectedNodes.add(node);

      var edge;
      (service.get('consumedservices')||[]).map(function(target) {
        var targetId = target.get('id');
        edge = cy.edges().filter(function(i, e) {
          return e.source().id() === serviceId && e.target().id() === targetId;
        })[0];

        if ( !edge )
        {
          relayout = true;
          edge = cy.add({
            group: 'edges',
            data: {
              source: serviceId,
              target: targetId,
            },
          })[0];
        }

        edge.data({
          color: (target.get('state') === 'active' ? '#41c77d' : (target.get('state') === 'inactive' ? '#f00' : '#f3bd24')),
        });

        expectedEdges = expectedEdges.add(edge);
      });
    });

    // Remove nodes & edges that shouldn't be there
    cy.nodes().not(expectedNodes).remove();
    cy.edges().not(expectedEdges).remove();
    console.log('end batch');
    cy.endBatch();
    if ( relayout || startNodes !== cy.nodes().length || startEdges !== cy.edges().length )
    {
      console.log('layout');
      cy.layout();
      console.log('end layout');
    }
    console.log('done updateGraph');
  },

  throttledUpdateGraph: function() {
    Ember.run.throttle(this,'updateGraph',500);
  }.observes('context.services.@each.{id,name,state,consumedServicesUpdated}'),

  graph: function() {
    var style = cytoscape.stylesheet()
      .selector('node')
        .css({
          'shape': 'data(shape)',
          'content': 'data(name)',
          'text-valign': 'center',
          'text-outline-width': 2,
          'text-outline-color': 'data(color)',
          'border-width': 2,
          'border-color': '#f4f5f8',
          'background-color': 'data(color)',
          'font-family': '"Open Sans"',
          'font-weight': 300,
          'font-size': 13,
          'color': '#fff',
        })
      .selector(':selected')
        .css({
          'border-width': 3,
          'border-color': '#333'
        })
      .selector('edge')
        .css({
          'opacity': 0.8,
          'width': 'mapData(strength, 70, 100, 2, 6)',
          'target-arrow-shape': 'triangle-backcurve',
          'source-arrow-shape': 'none',
          'line-color': 'data(color)',
          'source-arrow-color': 'data(color)',
          'target-arrow-color': 'data(color)'
        })
      .selector('edge.questionable')
        .css({
          'line-style': 'dotted',
          'target-arrow-shape': 'diamond'
        })
      .selector('.faded')
        .css({
          'opacity': 0.25,
          'text-opacity': 0
        });
    // End: style

    var cy = cytoscape({
      container: this.get('cyElem'),
      style: style,
      userZoomingEnabled: false,
      userPanningEnabled: false,
      layout: {
        name: 'dagre',
        animate: false,
        padding: 20,
        edgeSep: 20,
      },
    });

    this.set('cy', cy);
    this.updateGraph();
  },

  willDestroyElement: function() {
    this._super();
    var cy = this.get('cy');
    if ( cy )
    {
      cy.destroy();
    }

    var elem = this.get('cyElem');
    if ( elem )
    {
      $(elem).remove();
    }
  },
});
