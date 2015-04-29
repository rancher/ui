import Ember from 'ember';
import Util from 'ui/utils/util';
//import ThrottledResize from 'ui/mixins/throttled-resize';

export default Ember.View.extend({
  graphZoom: null,
  graphInner: null,
  graphOuter: null,
  graphRender: null,
  graph: null,

  didInsertElement: function() {
    this._super();
    var elem = $('<div id="environment-graph"><svg style="width: 100%; height: 100%;"><g/></svg></div>').appendTo('BODY');
    elem.css('top', $('MAIN').position().top + $('MAIN').height() + 'px');
    this.set('graphElem', elem[0]);

    Ember.run.later(this,'initGraph',100);
  },

  initGraph: function() {
    var outer = d3.select("#environment-graph svg");
    var inner = outer.select("g");
    var zoom = d3.behavior.zoom().on("zoom", function() {
     //   inner.attr("transform", "translate(" + d3.event.translate + ")" +
    //                                "scale(" + d3.event.scale + ")");
    });

    outer.call(zoom);

    var g = new dagreD3.graphlib.Graph().setGraph({
      rankdir: "TB",
      nodesep: 70,
      ranksep: 50,
      marginx: 30,
      marginy: 30
    });

    var render = new dagreD3.render();
    this.setProperties({
      graphZoom: zoom,
      graphOuter: outer,
      graphInner: inner,
      graphRender: render,
      graph: g
    });

    this.updateGraph();
  },

  updateGraph: function() {
    var g = this.get('graph');
    var services = this.get('context.services');
    var unremovedServices = services.filter(function(service) {
      return ['removed','purging','purged'].indexOf(service.get('state')) === -1;
    });

    unremovedServices.forEach(function(service) {
      var serviceId = service.get('id');
      var html = '<h4>'+ Util.escapeHtml(service.get('name')) + '</h4><h6 class="state">' + Util.escapeHtml(Util.ucFirst(service.get('state'))) + '</h6>';

      g.setNode(serviceId, {
        labelType: "html",
        label: html,
        padding: 0,
        class: (service.get('state') === 'active' ? 'green' : (service.get('state') === 'inactive' ? 'red' : 'yellow')),
      });
    });

    unremovedServices.forEach(function(service) {
      var serviceId = service.get('id');
      (service.get('consumedservices')||[]).map(function(target) {
        var targetId = target.get('id');
        var color = '#f3bd24';
        if ( target.get('state') === 'active' )
        {
          color = '#41c77d';
        }
        else if (target.get('state') === 'inactive' )
        {
          color = '#ff0000';
        }

        g.setEdge(serviceId, targetId, {
          label: '',
          arrowhead: 'vee',
          lineInterpolate: 'bundle',
          class: (target.get('state') === 'active' ? 'green' : (target.get('state') === 'inactive' ? 'red' : 'yellow')),
        });
      });
    });

    // Remove nodes & edges that shouldn't be there

    this.renderGraph();
    console.log('done updateGraph');
  },

  renderGraph: function() {
    console.log('start renderGraph');
    var zoom = this.get('graphZoom');
    var render = this.get('graphRender');
    var inner = this.get('graphInner');
    var outer = this.get('graphOuter');
    var g = this.get('graph');

    inner.call(render, g);

    // Zoom and scale to fit
    var zoomScale = zoom.scale();
    var graphWidth = g.graph().width + 80;
    var graphHeight = g.graph().height + 40;
    var width = $('#environment-graph').width();
    var height = $('#environment-graph').height();
    zoomScale = Math.min(width / graphWidth, height / graphHeight);
    var translate = [(width/2) - ((graphWidth*zoomScale)/2), (height/2) - ((graphHeight*zoomScale)/2)];
    zoom.translate(translate);
    zoom.scale(zoomScale);
    zoom.event(outer.transition().duration(500));
    console.log('done renderGraph');
  },

  throttledUpdateGraph: function() {
    Ember.run.throttle(this,'updateGraph',500);
  }.observes('context.services.@each.{id,name,state,consumedServicesUpdated}'),

  willDestroyElement: function() {
    this._super();
    var cy = this.get('cy');
    if ( cy )
    {
      cy.destroy();
    }

    var elem = this.get('graphElem');
    if ( elem )
    {
      $(elem).remove();
    }
  },
});
