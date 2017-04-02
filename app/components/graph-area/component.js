import Ember from 'ember';
import { GRADIENT_COLORS } from 'ui/components/svg-gradients/component';
import {
  formatPercent, formatMib, formatKbps
} from 'ui/utils/util';

const FORMATTERS = {
  value: (value) => {
    return value;
  },
  percent: formatPercent,
  mib: formatMib,
  kbps: formatKbps
};

export default Ember.Component.extend({
  tagName       : 'svg',
  classNames    : ['spark-line'],
  attributeBindings: ['cssSize:style'],

  intl          : Ember.inject.service(),
  data          : null,
  fields        : null,
  gradient      : null,
  width         : null,
  height        : 110,
  margin        : 2,

  min           : 0,
  minMax        : null,  // lower bound on how small automatic max can be
  max           : null,  // set an explicit max
  maxDoubleInital:false, // if true, set max to double the initial non-zero data point
  scaleDown     : false, // if true, max is allowed to go back down.  If false it can only go up.

  interpolation : 'basis', //'step-after',
  formatter     : 'value',

  svg           : null,
  line          : null,
  dot           : null,
  text          : null,
  textBg        : null,
  x             : null,
  y             : null,
  observedMax   : null, // The largest max seen so far

  init() {
    this._super(...arguments);
  },

  hasData: function() {
    if (this.get('data.length') > 0 && !this.get('svg')) {
      this.create();
    }
  }.observes('data.length'),

  cssSize: function() {
    let width = this.get('width')||'100%';
    let height = this.get('height')||'100%';
    return new Ember.String.htmlSafe(`width: ${width}; height: ${height}`);
  }.property('width', 'height'),

  lastValue: function() {
    var data = this.get('data');
    if (data && data.get('length')) {
      return data.objectAt(data.get('length') - 1);
    }
  }.property('data.[]'),

  create() {
    let fields = this.get('fields');
    let margin = this.get('margin');
    var svg = d3.select(this.$()[0])
      .attr('transform', 'translate(' + margin + ',' + margin + ')');

    let x = d3.scale.linear();
    let y = d3.scale.linear();

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .ticks(10);

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

    var line = d3.svg.area()
      .x((d, i) => {
        return x(i);
      })
      .y0(function(d) { return this.get('y')(d.y0); })
      .y1(function(d) { return this.get('y')(d.y0 + d.y); });

    var stack = d3.layout.stack()
      .values(function(d) { return d.values; });

    var areas = stack(fields.map(function(name) {
      return {
        name: name,
        values: data.map(function(d,idx) {
          return {idx: idx, y: d[name]};
        })
      };
    }));

    var slices = svg.selectAll(".slice")
      .data(areas)
      .enter().append("g")
      .attr("class", "slice");

    area.append("path")
      .attr("class", "area")
      .attr("d", function(d) { return area(d.values); })
      .style('fill', `url(${window.location.pathname}#${this.get('gradient')}-${d.idx}-gradient)`)

    this.setProperties({
      svg,
      x,
      y,
      xAxis,
      yAxis,
      stack,
      areas,
      line
    });
    this.updateLine();
  },

  updateLine: function() {
    var line = this.get('line');
    var interp = this.get('interpolation');

    if (line) {
      line.interpolate(interp);
    }

  }.observes('interpolation'),

  adjustMax(dataMax) {
    let optMinMax = this.get('minMax');
    let optMax = this.get('max');
    let optScaleDown = this.get('scaleDown');
    let observedMax = this.get('observedMax');

    let out = dataMax;

    if ( optMax ) {
      out = optMax;
    } else if ( optMinMax ) {
      out = Math.max(optMinMax, out);
    }

    if ( observedMax && !optScaleDown ) {
      out = Math.max(observedMax, out);
    }

    if ( !observedMax && out > 0 && this.get('maxDoubleInital') ) {
      out *= 2;
    }

    this.set('observedMax', out);
    return out;
  },

  update: function() {
    var svg = this.get('svg');
    var data = (this.get('data') || []).slice();
    var x = this.get('x');
    var y = this.get('y');
    var line = this.get('line');
    var width = this.get('width');
    var height = this.get('height');
    var margin = this.get('margin');

    if (svg && data && x && y && line) {
      x.domain([0, data.get('length') - 1]);
      x.range([0, width - margin]);

      var min = this.get('min') === null ? d3.min(data) : this.get('min');

      var max = d3.max(data, function(d) {
        return d3.sum(d3.keys(d).map((k) => d[k]));
      });
      max = this.adjustMax(max);

      y.domain([min, max]);
      y.range([height-margin, margin]);
      y.rangeRound([height-margin, margin]);

      //console.log('update', data[data.length-2], data[data.length-1], x.domain(), x.range(), y.domain(), y.range());
      svg.selectAll('path')
        .data([data])
        .attr('d', line);
    }
  }.observes('data.[]'),
});
