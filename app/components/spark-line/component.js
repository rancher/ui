import Ember from 'ember';
import {
  formatPercent, formatMib, formatKbps
}
from 'ui/utils/util';

const formatters = {
  value: (value) => {
    return value;
  },
  percent: formatPercent,
  mib: formatMib,
  kbps: formatKbps
};

export default Ember.Component.extend({
  attributeBindings: ['cssSize:style', 'tooltip'],
  tagName       : 'span',
  classNames    : ['spark-line'],

  intl          : Ember.inject.service(),
  data          : null,
  width         : null,
  height        : 20,
  min           : 0,
  max           : null,
  interpolation : 'step-after',
  formatter     : 'value',
  prefix        : '',
  type          : null,

  svg           : null,
  line          : null,
  dot           : null,
  x             : null,
  y             : null,
  tooltipModel: null,

  init() {
    window.spark = this;
    this._super();
  },

  didInsertElement() {
    this._super();
  },

  hasData: function() {
    if (this.get('data.length') > 0 && !this.get('svg')) {
      this.create();
    }
  }.observes('data.length'),

  cssSize: function() {
    return new Ember.String.htmlSafe('width: ' + this.get('width') + 'px; height: ' + this.get('height') + 'px');
  }.property('width', 'height'),

  lastValue: function() {
    var data = this.get('data');
    if (data && data.get('length')) {
      return data.objectAt(data.get('length') - 1);
    }
  }.property('data.[]'),

  tooltip: function() {
    let prefix     = this.get('prefix');
    let prefixI18n = null;
    let out        = null;

    if (prefix) {
      prefixI18n = this.get('intl').findTranslationByKey(prefix);
      out = `${this.get('intl').formatMessage(prefixI18n)} ${formatters[this.get('formatter')](this.get('lastValue'))}`;
    } else {
      out = ` ${formatters[this.get('formatter')](this.get('lastValue'))}`;
    }

    Ember.run.next(() => {
      this.set('tooltipModel', out);
    });
  }.property('prefix', 'lastValue', 'formatter'),

  create() {
    var svg = d3.select(this.$()[0])
      .append('svg:svg')
      .attr('width', '100%')
      .attr('height', '100%');

    var gradient = svg.append('svg:defs')
      .append("svg:linearGradient")
      .attr('id', `${this.get('type')}-gradient`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%')
      .attr('spreadMethod', 'pad');

    gradient.append('svg:stop')
      .attr('offset', '0%')
      .attr('stop-color', this.typePath())
      .attr('stop-opacity', '1');

    gradient.append('svg:stop')
      .attr('offset', '100%')
      .attr('stop-color', this.typePath())
      .attr('stop-opacity', '.1');

    this.set('svg', svg);
    this.set('x', d3.scale.linear());
    this.set('y', d3.scale.linear());

    var line = d3.svg.area()
      .x((d, i) => {
        return this.get('x')(i);
      })
      .y0(this.get('height'))
      .y1((d) => {
        return this.get('y')(d);
      });

    this.set('line', line);

    this.updateLine();

    svg.append('path')
      .attr('class', `spark-path ${this.get('type')}-path`)
      .attr('d', line(this.get('data')));

  },

  typePath: function() {
    var out;

    switch (this.get('type')) {
      case 'cpu':
        out = '#2ecc71'; //$green
        break;
      case 'memory':
        out = '#00558b'; //$blueDark
        break;
      case 'network':
        out = '#d35401'; //$orangeDark
        break;
      case 'storage':
        out = '#3a6f81'; //$teal
        break;
      default:
        break;
    }

    return out;
  },

  updateLine: function() {
    var line = this.get('line');
    var interp = this.get('interpolation');

    if (line) {
      line.interpolate(interp);
    }

  }.observes('interpolation'),

  update: function() {
    var svg = this.get('svg');
    var data = (this.get('data') || []).slice();
    var x = this.get('x');
    var y = this.get('y');
    var line = this.get('line');
    var width = this.get('width');
    var height = this.get('height');

    if (svg && data && x && y && line) {
      x.domain([0, data.get('length') - 1]);
      x.range([0, width - 1]);

      var min = this.get('min') === null ? d3.min(data) : this.get('min');
      var max = this.get('max') === null ? d3.max(data) : this.get('max');
      y.domain([min, max]);
      y.range([height, 0]);
      y.rangeRound([height, 0]);

      //console.log('update', data[data.length-2], data[data.length-1], x.domain(), x.range(), y.domain(), y.range());
      svg.selectAll('path')
        .data([data])
        .style('fill', `url(${window.location.pathname}#${this.get('type')}-gradient)`)
        .attr('d', line);
    }
  }.observes('data', 'data.[]'),
});
