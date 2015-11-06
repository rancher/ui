import Ember from 'ember';
import Util from 'ui/utils/util';
import ThrottledResize from 'ui/mixins/throttled-resize';
import { activeIcon } from 'ui/models/service';

export default Ember.View.extend(ThrottledResize,{
  classNames: ['environment-graph'],
  graphZoom: null,
  graphInner: null,
  graphOuter: null,
  graphRender: null,
  graph: null,

  didInsertElement: function() {
    this._super();
    var elem = $('<div id="environment-svg"><svg style="width: 100%; height: 100%;"><g/></svg></div>').appendTo('BODY');
    this.set('graphElem', elem[0]);

    Ember.run.later(this,'initGraph',100);
  },


  click: function(evt) {
    if ($(evt.target).hasClass('icon-x')) {
      this.styleSvg();
    }
  },

  onResize: function() {
    $('#environment-svg').css('top', $('MAIN').position().top + 55 + 'px');
    if ( this.get('graph') )
    {
      this.renderGraph();
    }
  },

  initGraph: function() {
    var outer = d3.select("#environment-svg svg");
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
    $(outer[0]).on('click', (event) => {
      var fo = $(event.target).closest('foreignObject');

      if ( fo )
      {
        if ( this.get('currentFO') ) {
          this.get('currentFO').find('>div').removeClass('highlighted');

          this.set('prevFO', this.get('currentFO'));

          this.set('currentFO', fo);

          fo.find('>div').addClass('highlighted');

        } else {
          this.set('currentFO', fo);

          fo.find('>div').addClass('highlighted');

        }

        var serviceId = $('span[data-service]', fo).data('service');

        if ( serviceId )
        {
          this.showService(serviceId);

          return;
        }
      }

      this.showService(null);

      this.setProperties({
        currentFO: null,
        prevFO: null,
      });

    });
  },

  styleSvg: function(height='100%') {
    $('#environment-svg svg').css('height', height);
  },

  showService: function(id) {
    if ( id )
    {
      var svgHeight = $('#environment-svg').height() - 310; // svg minus the height of info service-addtl-info.scss
      this.styleSvg(`${svgHeight}px`);
      this.set('context.showServiceInfo', true);
      this.set('context.selectedService', this.get('context.model.services').findBy('id', id));
    }
    else
    {
      this.styleSvg();
      this.set('context.showServiceInfo', null);
    }
  },

  crosslinkServices: function() {
    // Add services that are cross-linked from another environment
    var out = [];

    var unremovedServices = this.get('context.model.services').filter(function(service) {
      return ['removed','purging','purged'].indexOf(service.get('state')) === -1;
    });

    unremovedServices.forEach((service) => {
      var externals = (service.get('consumedServicesWithNames')||[]).filter((linked) => {
        return linked.get('service.environmentId') !== this.get('context.model.id');
      }).map((linked) => { return linked.get('service'); });
      out.pushObjects(externals);
    });

    return out;
  }.property('context.model.services.@each.consumedServicesUpdated'),

  updateGraph: function() {
    var g = this.get('graph');
    var services = this.get('context.model.services');
    var unremovedServices = services.filter(function(service) {
      return ['removed','purging','purged'].indexOf(service.get('state')) === -1;
    });

    var unexpectedNodes = g.nodes();
    var unexpectedEdges = g.edges();

    var expectedServices = unremovedServices.slice();
    expectedServices.pushObjects(this.get('crosslinkServices'));

    expectedServices.forEach((service) => {
      var serviceId = service.get('id');
      var color = (service.get('state') === 'active' ? 'green' : (service.get('state') === 'inactive' ? 'red' : 'yellow'));
      var instances = service.get('instances.length')||'No';
      var isCrossLink = service.get('environmentId') !== this.get('context.model.id');

      var envName = '';
      if ( isCrossLink )
      {
        envName = service.get('displayEnvironment') + '/';
      }

      var html = `<span data-service="${service.get('id')}"></span><i class="icon  ${activeIcon(service)}"></i>
                  <h4 class="clip">${envName}${Util.escapeHtml(service.get('displayName'))}</h4>
                  <h6 class="count"><b>${instances}</b> container${(instances === 1 ? '' : 's')}</h6>
                  <h6><span class="state ${color}">${Util.escapeHtml(Util.ucFirst(service.get('state')))}</span></h6>`;

      g.setNode(serviceId, {
        labelType: "html",
        label: html,
        padding: 0,
        class: color + (isCrossLink ? ' crosslink' : ''),
      });

      unexpectedNodes.removeObject(serviceId);
    });

    unremovedServices.forEach(function(service) {
      var serviceId = service.get('id');
      (service.get('consumedServicesWithNames')||[]).map(function(map) {
        var target = map.get('service');
        var targetId = target.get('id');
        var color = (target.get('state') === 'active' ? 'green' : (target.get('state') === 'inactive' ? 'red' : 'yellow'));

        var edgeOpts = {
          arrowhead: 'vee',
          lineInterpolate: 'bundle',
          class: color,
        };

        var mapName = map.get('name');
        if ( mapName && mapName !== target.get('name') )
        {
          edgeOpts.label = mapName;
        }

        g.setEdge(serviceId, targetId, edgeOpts);

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
      g.removeEdge(edge.v, edge.w);
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
    var width = $('#environment-svg').width();
    var height = $('#environment-svg').height();
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
  }.observes('context.model.services.@each.{id,name,state,consumedServicesUpdated}','crosslinkServices.@each.{id,name,state,displayEnvironment}'),

  willDestroyElement: function() {
    this._super();
    var elem = this.get('graphElem');
    if ( elem )
    {
      $(elem).remove();
    }
  },
});
