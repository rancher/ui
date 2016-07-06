import Ember from 'ember';
import Util from 'ui/utils/util';
import ThrottledResize from 'ui/mixins/throttled-resize';
import { activeIcon } from 'ui/models/service';
import C from 'ui/utils/constants';


export default Ember.Component.extend(ThrottledResize, {
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

    if (this.get('model.stack.services.length')) {
      Ember.run.later(this,'initGraph',100);
    } else {
      this.set('controller.noServices', true);
    }
  },


  click: function(evt) {
    if ($(evt.target).hasClass('icon-x')) {
      this.styleSvg();
    }
  },

  onResize: function() {
    $('#environment-svg').css('top', $('MAIN').position().top + 55 + 'px');
    $('#environment-svg').css('bottom', $('FOOTER').outerHeight() + 'px');
    if ( this.get('graph') )
    {
      this.renderGraph();
    }
  },

  initGraph: function() {
    var outer = d3.select("#environment-svg svg");  // SVG must be lowercase!   This is case sensitive in not-Chrome
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
      if ( this._state === 'destroying' )
      {
        return;
      }

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
    let svgHeight;
    if ( id ) {
        svgHeight = $('#environment-svg').height() - 260; // svg minus the height of info service-addtl-info.scss
        this.styleSvg(`${svgHeight}px`);

        if (!this.get('model.showServiceInfo')) {
          this.zoomAndScale(1.5);
        }

        this.set('model.showServiceInfo', true);
        this.set('model.selectedService', this.get('model.stack.services').findBy('id', id));
    } else {
      svgHeight = $('#environment-svg').height() - 0; // svg minus the height of info service-addtl-info.scss
      this.styleSvg(svgHeight);

      if (this.get('model.showServiceInfo')) {
        this.zoomAndScale(2);
      }

      this.set('model.showServiceInfo', null);
    }
  },

  crosslinkServices: function() {
    // Add services that are cross-linked from another environment
    var out = [];

    var unremovedServices = this.get('model.stack.services').filter(function(service) {
      return C.REMOVEDISH_STATES.indexOf(service.get('state')) === -1;
    });

    unremovedServices.forEach((service) => {
      var externals = (service.get('consumedServicesWithNames')||[]).filter((linked) => {
        return linked.get('service.environmentId') !== this.get('model.stack.id');
      }).map((linked) => { return linked.get('service'); });
      out.pushObjects(externals);
    });

    return out;
  }.property('model.stack.services.@each.consumedServicesUpdated'),

  updateGraph: function() {
    var g = this.get('graph');
    var services = this.get('model.stack.services');
    var unremovedServices = services.filter(function(service) {
      return ['removed','purging','purged'].indexOf(service.get('state')) === -1;
    });

    var unexpectedNodes = g.nodes();
    var unexpectedEdges = g.edges();

    var expectedServices = unremovedServices.slice();
    expectedServices.pushObjects(this.get('crosslinkServices'));

    expectedServices.forEach((service) => {
      var serviceId = service.get('id');
      var instances = service.get('instances.length')||'No';
      var color = service.get('stateColor').replace('text-','');
      var isCrossLink = service.get('environmentId') !== this.get('model.stack.id');

      var envName = '';
      if ( isCrossLink )
      {
        envName = service.get('displayEnvironment') + '/';
      }

      var html = `<span data-service="${service.get('id')}"></span><i class="icon  ${activeIcon(service)}"></i>
                  <h4 class="clip">${envName}${Util.escapeHtml(service.get('displayName'))}</h4>
                  <h6 class="count"><b>${instances}</b> container${(instances === 1 ? '' : 's')}</h6>
                  <h6><span class="state ${color}">${Util.escapeHtml(service.get('displayState'))}</span></h6>`;

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
        var color = target.get('stateColor').replace('text-','');
        var markerColor = color+'-fill';

        var edgeOpts = {
          arrowhead: 'vee',
          customMarkerURL: window.location.pathname,
          customMarkerClass: markerColor,
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

  zoomAndScale: function(scaleFactor=2.0) {
    var zoom = this.get('graphZoom');
    var outer = this.get('graphOuter');
    var g = this.get('graph');

    // Zoom and scale to fit
    var zoomScale = zoom.scale();
    var graphWidth = g.graph().width;
    var graphHeight = g.graph().height;
    var width = $('#environment-svg svg').width();
    var height = $('#environment-svg svg').height();
    zoomScale = Math.min(scaleFactor, Math.min(width / graphWidth, height / graphHeight));
    var translate = [(width/2) - ((graphWidth*zoomScale)/2), (height/2) - ((graphHeight*zoomScale)/2)];
    zoom.translate(translate);
    zoom.scale(zoomScale);
    zoom.event(outer);
  },

  renderGraph: function() {
    var render = this.get('graphRender');
    var inner = this.get('graphInner');
    var g = this.get('graph');

    inner.call(render, g);

    this.zoomAndScale();

    // Overflow the foreignObjects
    $(this.get('graphElem').getElementsByTagName('foreignObject')).css('overflow','visible');
  },

  throttledUpdateGraph: function() {
    Ember.run.throttle(this,'updateGraph',250);
  }.observes('model.stack.services.@each.{id,name,displayState,consumedServicesUpdated}','crosslinkServices.@each.{id,name,displayState,displayEnvironment}'),

  willDestroyElement: function() {
    this._super();
    this.set('controller.noServices', false);
    var elem = this.get('graphElem');
    if ( elem )
    {
      $(elem).remove();
    }
  },
});
