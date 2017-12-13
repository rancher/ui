const HEALTHY_CIRCLE_COLOR = '#23A454';
const UNHEALTHY_CIRCLE_COLOR = '#EF494A';

const HEALTHY_BACKGROUND_COLOR = '#F1F9F5';
const UNHEALTHY_BACKGROUND_COLOR = '#FEF3F4';

const HEALTHY_TEXT_COLOR = '#23A454';
const UNHEALTHY_TEXT_COLOR = '#EF494A';

export default function initGraph(options) {
  const { el, r, width, height, margin, fontSize } = getConfig(options);
  const svg = d3.select(el).append('svg').attr('width', width).attr('height', height);

  const rectangle = svg.append("rect").attr("x", r).attr("y", margin).attr("width", width).attr("height", height - margin*2)
    .style("fill", options.healthy ? HEALTHY_BACKGROUND_COLOR: UNHEALTHY_BACKGROUND_COLOR);

  const circle = svg.append("circle").attr("cx", r).attr("cy", r).attr("r", r)
    .style("fill", options.healthy ? HEALTHY_CIRCLE_COLOR: UNHEALTHY_CIRCLE_COLOR);

  const text = svg.append("svg:text")
    .attr("x", 3*r)
    .attr("y", height/2)
    .attr("dy", fontSize / 2)
    .attr("text-anchor", "start")
    .text(options.component)
    .style("font-size", fontSize + "px")
    .style("fill", options.healthy ? HEALTHY_TEXT_COLOR: UNHEALTHY_TEXT_COLOR)
    .style("stroke", options.healthy ? HEALTHY_TEXT_COLOR: UNHEALTHY_TEXT_COLOR);

  const icon = svg.append('image')
    .attr("x", 0.5*r)
    .attr("y", 0.5*r)
    .attr('width', r).attr('height', r)
    .attr("xlink:href", options.healthy ? "/assets/images/checkmark.svg" : "/assets/images/flag.svg");

  return {
    updateHealthStatus(healthy) {
      rectangle.style("fill", healthy ? HEALTHY_BACKGROUND_COLOR: UNHEALTHY_BACKGROUND_COLOR);
      circle.style("fill", healthy ? HEALTHY_CIRCLE_COLOR: UNHEALTHY_CIRCLE_COLOR);
      text.style("fill", healthy ? HEALTHY_TEXT_COLOR: UNHEALTHY_TEXT_COLOR)
        .style("stroke", healthy ? HEALTHY_TEXT_COLOR: UNHEALTHY_TEXT_COLOR);
      icon.attr("xlink:href", healthy ? "/assets/images/checkmark.svg" : "/assets/images/flag.svg");
    },

    fit() {
      fit(svg, el, rectangle, circle, text, icon);
    },
  };
}

function fit(svg, el, rectangle, circle, text, icon) {
  const { r, width, height, margin, fontSize } = getConfig({el});
  svg.attr('width', width).attr('height', height);
  rectangle.attr("x", r).attr("y", margin).attr("width", width).attr("height", height - margin*2);
  circle.attr("cx", r).attr("cy", r).attr("r", r);
  text.attr("x", 3*r).attr("y", height/2).attr("dy", fontSize / 2).style("font-size", fontSize + "px");
  icon.attr("x", 0.5*r).attr("y", 0.5*r).attr('width', r).attr('height', r);
}

function getWidth(el) {
  const width = el.parentNode.offsetWidth;
  return width > 0 ? width : 0;
}

function getConfig(options) {
  const width = getWidth(options.el);
  const height = width/2.5;
  return {
    el: options.el,
    r: height / 8,
    fontSize: width / 25,
    margin: height / 30,
    width,
    height: height / 4,
  };
}
