export default function initGraph(options) {
  const {
    el, r, width, height, margin, fontSize
  } = getConfig(options);
  const svg = d3.select(el).append('svg').attr('width', width).attr('height', height);

  const healthyStatus = options.healthy ? 'healthy' : 'unhealthy';

  const rectangle = svg.append('rect').attr('x', r).attr('y', margin).attr('width', width)
    .attr('height', height - margin * 2)
    .attr('class', `${ healthyStatus } background`);

  const circle = svg.append('circle').attr('cx', r).attr('cy', r).attr('r', r)
    .attr('class', `${ healthyStatus } circle`);

  const text = svg.append('svg:text')
    .attr('x', 3 * r)
    .attr('y', height / 2)
    .attr('dy', fontSize / 2)
    .attr('text-anchor', 'start')
    .text(options.component)
    .style('font-size', `${ fontSize  }px`)
    .attr('class', `${ healthyStatus } text`);

  const icon = svg.append('image')
    .attr('x', 0.5 * r)
    .attr('y', 0.5 * r)
    .attr('width', r)
    .attr('height', r)
    .attr('xlink:href', options.healthy ? '/assets/images/checkmark.svg' : '/assets/images/flag.svg');

  return {
    updateHealthStatus(healthy) {
      rectangle.attr('class', `${ healthyStatus } background`);
      circle.attr('class', `${ healthyStatus } circle`);
      text.attr('class', `${ healthyStatus } text`);
      icon.attr('xlink:href', healthy ? '/assets/images/checkmark.svg' : '/assets/images/flag.svg');
    },

    fit() {
      fit(svg, el, rectangle, circle, text, icon);
    },
  };
}

function fit(svg, el, rectangle, circle, text, icon) {
  const {
    r, width, height, margin, fontSize
  } = getConfig({ el });

  svg.attr('width', width).attr('height', height);
  rectangle.attr('x', r).attr('y', margin).attr('width', width).attr('height', height - margin * 2);
  circle.attr('cx', r).attr('cy', r).attr('r', r);
  text.attr('x', 3 * r).attr('y', height / 2).attr('dy', fontSize / 2).style('font-size', `${ fontSize  }px`);
  icon.attr('x', 0.5 * r).attr('y', 0.5 * r).attr('width', r).attr('height', r);
}

function getWidth(el) {
  const width = el.parentNode.offsetWidth;

  return width > 0 ? width : 0;
}

function getConfig(options) {
  const width = getWidth(options.el);
  const height = width / 2.5;

  return {
    el:       options.el,
    r:        height / 8,
    fontSize: width / 25,
    margin:   height / 30,
    width,
    height:   height / 4,
  };
}
