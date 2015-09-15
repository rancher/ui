import Ember from 'ember';
import { formatPercent, formatMib, formatKbps } from 'ui/utils/util';

const formatters = {
  value: (value) => { return value; },
  percent: formatPercent,
  mib: formatMib,
  kbps: formatKbps
};

const DOT_SIZE = 2;

export default Ember.Component.extend({
  data: null,
  tagName: 'span',
  classNames: ['spark-line'],
  attributeBindings: ['cssSize:style','tooltip'],

  width: null,
  height: 20,
  min: 0,
  max: null,
  interpolation: 'step-after',
  formatter: 'value',
  prefix: '',

  svg: null,
  line: null,
  dot: null,
  x: null,
  y: null,

  init() {
    window.spark = this;
    this._super();
  },

  didInsertElement() {
    this._super();
  },

  hasData: function() {
    if ( this.get('data.length') > 0 && !this.get('svg') )
    {
      this.create();
    }
  }.observes('data.length'),

  cssSize: function() {
    return new Ember.Handlebars.SafeString('width: ' + this.get('width') + 'px; height: ' + this.get('height') + 'px');
  }.property('width','height'),

  lastValue: function() {
    var data = this.get('data');
    if ( data && data.get('length') )
    {
      return data.objectAt(data.get('length')-1);
    }
  }.property('data.[]'),

  tooltip: function() {
    return (this.get('prefix')||'') + formatters[this.get('formatter')](this.get('lastValue'));
  }.property('prefix','lastValue','formatter'),

  create() {
    var svg = d3.select(this.$()[0])
                  .append('svg:svg')
                  .attr('width','100%')
                  .attr('height','100%');

    this.set('svg', svg);
    this.set('x', d3.scale.linear());
    this.set('y', d3.scale.linear());

    var line = d3.svg.area()
                .x((d,i) => { return this.get('x')(i); })
                .y0(this.get('height'))
                .y1((d)   => { return this.get('y')(d); });
    this.set('line', line);

    this.updateLine();

    svg.append('path').attr('class','spark-path').attr('d', line(this.get('data')));
    svg.append('rect').attr('class','spark-dot').attr('width', DOT_SIZE).attr('height', DOT_SIZE);
  },

  updateLine: function() {
    var line   = this.get('line');
    var interp = this.get('interpolation');
    if ( line )
    {
      line.interpolate(interp);
    }
  }.observes('interpolation'),

  update: function() {
    var svg = this.get('svg');
    var data = (this.get('data')||[]).slice();
    var x = this.get('x');
    var y = this.get('y');
    var line = this.get('line');
    var width = this.get('width');
    var height = this.get('height');

    if ( svg && data && x && y && line )
    {
      x.domain([0, data.get('length')-1]);
      x.range([0, width-1]);

      var min = this.get('min') === null ? d3.min(data) : this.get('min');
      var max = this.get('max') === null ? d3.max(data) : this.get('max');
      y.domain([min,max]);
      y.range([height,0]);
      y.rangeRound([height,0]);

      //console.log('update', data[data.length-2], data[data.length-1], x.domain(), x.range(), y.domain(), y.range());
      svg.selectAll('rect')
        .attr('x', width-DOT_SIZE)
        .attr('y', Math.max(0, Math.min(y(data[data.length-1]) - DOT_SIZE/2, height-DOT_SIZE)));

      svg.selectAll('path')
        .data([data])
        .attr('d', line);
    }
  }.observes('data','data.[]'),
});
