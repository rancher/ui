import Component from '@ember/component';
import layout from './template';

export const GRADIENT_COLORS = {
  'cpu':     ['#2ECC71', '#DBE8B1'],
  'memory':  ['#00558B', '#AED6F1'],
  'network': ['#E49701', '#F1C40F'],
  'storage': ['#3A6F81', '#ABCED3'],
};

export default Component.extend({
  layout,
  tagName: '',
  didInsertElement() {

    var svg = d3.select('body').append('svg:svg')
      .attr('id', 'svg-gradients')
      .attr('height', '0')
      .attr('height', '0')
      .attr('width', '0')
      .style('position', 'absolute');

    var defs = svg.append('svg:defs');

    Object.keys(GRADIENT_COLORS).forEach((name) => {

      GRADIENT_COLORS[name].forEach((val, idx) => {

        var gradient = defs.append('svg:linearGradient')
          .attr('id', `${ name }-${ idx }-gradient`)
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '0%')
          .attr('y2', '100%')
          .attr('spreadMethod', 'pad');

        gradient.append('svg:stop')
          .attr('offset', '0%')
          .attr('stop-color', val)
          .attr('stop-opacity', '0.5');
        gradient.append('svg:stop')
          .attr('offset', '10%')
          .attr('stop-color', val)
          .attr('stop-opacity', '0.25');
        gradient.append('svg:stop')
          .attr('offset', '100%')
          .attr('stop-color', val)
          .attr('stop-opacity', '0.1');

      });

    });

  },
});
