import Ember from 'ember';


export default Ember.Component.extend({
  data: null,
  classNames: ['col-sm-12', 'col-md-4', 'col-md-height', 'col-md-full-height', 'col-top'],
  //attributeBindings: ['tooltip'],
  tagName: 'div',

  width: null,
  height: 110,
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


  didInsertElement: function() {
    this.set('width', this.$('#inner-content').width());
  },

  hasData: function() {
    if (this.get('data.length') > 0 && !this.get('svg')) {
      this.create();
    }
  }.observes('data.length'),

  create() {
    var svg = d3.select(this.$('#cpu-graph')[0])
      .append('svg:svg')
      .attr('width', '100%')
      .attr('height', '100%');

    this.set('svg', svg);
    this.set('x', d3.scale.linear().range([0, this.get('width')]));
    this.set('y', d3.scale.linear().range([this.get('height'), 0]));

    var line = d3.svg.line()
      .x((d, i) => {
        return this.get('x')(i);
      })
      .y((d) => {
        return this.get('y')(d);
      });
    this.set('line', line);

    //svg.append('path').attr('class', `node-${this.get('data')[0][0]}`).attr('d', line(this.get('data')[0].slice(1)))
      //.attr('stroke', 'green')
      //.attr('stroke-width', 2)
      //.attr('fill', 'none');
  },

  generateYAxis: function() {
    var out;
    if (this.get('type') === 'cpu') {
      out = d3.svg.axis()
        .scale(this.get('y'))
        .ticks(6)
        .tickFormat(function(d) { return d + "%"; })
        .orient('right');
    } else {
      out = d3.svg.axis()
        .scale(this.get('y'))
        .ticks(6)
        .orient('right');
    }
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

    if (svg && data && x && y && line) {
      x.domain([0, 60]);
      x.range([0, width - 1]);

      y.domain([0, 100]);
      y.range([height, 0]);


      var yAxis = this.generateYAxis();

      //svg.selectAll('path')
        //.data([data[0].splice(1)])
        //.attr('d', line);

      data.forEach((v,i,d) => { // jshint ignore:line
        //debugger;
        if (svg.select(`.node-${v[0]}`)[0][0]) {
          /*svg.select(`.node-${v[0]}`)
          .data(v.slice(1))
          .attr('d', line);*/
        } else {
          //debugger;
          svg.append('path').attr('class', `node-${v[0]}`).attr('d', line(v.slice(1)))
          .attr('stroke', 'green')
          .attr('stroke-width', 2)
          .attr('fill', 'none');
        }
      });
      svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(0, 0)')
        .call(yAxis);

    }
  }.observes('data', 'data.[]'),
});
