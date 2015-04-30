import Ember from 'ember';
import Util from 'ui/utils/util';
import ThrottledResize from 'ui/mixins/throttled-resize';

export default Ember.View.extend(ThrottledResize,{
  graphZoom: null,
  graphInner: null,
  graphOuter: null,
  graphRender: null,
  graph: null,

  didInsertElement: function() {
    this._super();
    var elem = $('<div id="environment-graph"><svg style="width: 100%; height: 100%;"><g/></svg></div>').appendTo('BODY');
    this.set('graphElem', elem[0]);

    Ember.run.later(this,'initGraph',100);
  },

  onResize: function() {
    $('#environment-graph').css('top', $('MAIN').position().top + 55 + 'px');
    if ( this.get('graph') )
    {
      this.renderGraph();
    }
  },

  initGraph: function() {
    var outer = d3.select("#environment-graph svg");
    var inner = outer.select("g");
    var zoom = d3.behavior.zoom().on("zoom", function() {
       inner.attr("transform", "translate(" + d3.event.translate + ")" +
                                   "scale(" + d3.event.scale + ")");
    });

    outer.call(zoom);

    var g = new dagreD3.graphlib.Graph().setGraph({
      rankdir: "TB",
      nodesep: 50,
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

    var unexpectedNodes = g.nodes();
    var unexpectedEdges = g.edges();

    unremovedServices.forEach(function(service) {
      var serviceId = service.get('id');
      var color = (service.get('state') === 'active' ? 'green' : (service.get('state') === 'inactive' ? 'red' : 'yellow'));
      var instances = service.get('instances.length')||'No';

      var html =  '<i class="icon ss-layergroup"></i>' +
                  '<h4>'+ Util.escapeHtml(service.get('name')) + '</h4>' +
                  '<h6 class="count"><b>' + instances + '</b> container' + (instances === 1 ? '' : 's') + '</h6>' +
                  '<h6><span class="state '+ color +'">' + Util.escapeHtml(Util.ucFirst(service.get('state'))) + '</span></h6>';

      g.setNode(serviceId, {
        labelType: "html",
        label: html,
        padding: 0,
        class: color,
      });

      unexpectedNodes.removeObject(serviceId);
    });

    unremovedServices.forEach(function(service) {
      var serviceId = service.get('id');
      (service.get('consumedservices')||[]).map(function(target) {
        var targetId = target.get('id');
        var color = (target.get('state') === 'active' ? 'green' : (target.get('state') === 'inactive' ? 'red' : 'yellow'));

        g.setEdge(serviceId, targetId, {
          lineInterpolate: 'bundle',
          class: color,
        });

        var existing = unexpectedEdges.filter(function(edge) {
          return edge.v === serviceId && edge.w === targetId;
        });
        unexpectedEdges.removeObjects(existing);
      });
    });

    // Remove nodes & edges that shouldn't be there anymore
    unexpectedNodes.forEach(function(node) {
      g.removeNode(node);
    });

    unexpectedEdges.forEach(function(edge) {
      g.removeNode(edge.v, edge.w);
    });

    this.renderGraph();
  },

  renderGraph: function() {
    var zoom = this.get('graphZoom');
    var render = this.get('graphRender');
    var inner = this.get('graphInner');
    var outer = this.get('graphOuter');
    var g = this.get('graph');

    inner.call(render, g);

    // Zoom and scale to fit
    var zoomScale = zoom.scale();
    var graphWidth = g.graph().width;
    var graphHeight = g.graph().height;
    var width = $('#environment-graph').width();
    var height = $('#environment-graph').height();
    zoomScale = Math.min(2.0, Math.min(width / graphWidth, height / graphHeight));
    var translate = [(width/2) - ((graphWidth*zoomScale)/2), (height/2) - ((graphHeight*zoomScale)/2)];
    zoom.translate(translate);
    zoom.scale(zoomScale);
    zoom.event(outer);

    // Overflow the foreignObjects
    $(this.get('graphElem').getElementsByTagName('foreignObject')).css('overflow','visible');
  },

  throttledUpdateGraph: function() {
    Ember.run.throttle(this,'updateGraph',250);
  }.observes('context.services.@each.{id,name,state,consumedServicesUpdated}'),

  willDestroyElement: function() {
    this._super();
    var elem = this.get('graphElem');
    if ( elem )
    {
      $(elem).remove();
    }
  },
});
