const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 100;
const DEFAULT_THICHNESS = 10;
const DEFAULT_GAUGE_COLOR = '#87e3ae';
const DEFAULT_MARGIN = 10;
const DEFAULT_FONT_SIZE = 20;
const triangleSize = 5;

export default function initGraph(options) {
  const { el, width, height, margin, thickness, gaugeColor, fontSize } = getConfig(options);

  const svg = d3.select(el).append('svg')
    .attr('width', width).attr('height', height);

  const valuePath = addArcValue(svg, width, margin, thickness, gaugeColor, options.value);
  addBottomLine(svg, width, height);
  let tooltip = addTooltip();
  addTicks(svg, tooltip, width, height, margin, options.ticks);
  const { valueLabel, titleLabel, subtitleLabel } = addLabels(svg, options, width, height, fontSize);

  return {
    updateTitle(text) {
      titleLabel.text(text);
    },
    updateSubTitle(text) {
      subtitleLabel.text(text);
    },
    updateValue(text) {
      text = text ? `${text}%` : '';
      valueLabel.text(text);
      if (text) {
        const r = calcR(width, margin);
        valuePath.attr('d', createArc(-90, parseInt(text, 10), r, thickness));
      }
    },
    updateTicks(ticks) {
      svg.selectAll('path[tick = "custom"]').remove();
      addTicks(svg, tooltip, width, height, margin, ticks);
    },
  };
}

function addTooltip() {
  let tooltip = d3.select('#percent-gauge-tooltip');
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div")
      .attr("class", "tooltip percent-gauge")
      .attr("id", "percent-gauge-tooltip")
      .style("opacity", 0);
  }
  return tooltip;
}

function addArcValue(svg, width, margin, thickness, gaugeColor, value) {
  addArc(svg, width, margin, thickness, 'none', 100);
  return addArc(svg, width, margin, thickness, gaugeColor, value);
}

function addLabels(svg, options, width, height, fontSize) {
  return {
    valueLabel: addText(options.value ? `${options.value}%` : '', svg, width / 2, height / 4 + fontSize / 1.2, fontSize),
    titleLabel: addText(options.title, svg, width / 2, height / 4 + 2 * fontSize, fontSize / 1.5),
    subtitleLabel: addText(options.subtitle, svg, width / 2, height / 4 + 3 * fontSize, fontSize / 2),
  }
}

function addBottomLine(svg, width, height) {
  const lineFunction = d3.svg.line()
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .interpolate("linear");

  svg.append("path")
    .attr("d", lineFunction([{ "x": 0, "y": height }, { "x": width, "y": height }]))
    .attr("stroke", "black")
    .attr("stroke-width", 5)
    .attr("fill", "none");
}

function addTicks(svg, tooltip, width, height, margin, ticks) {
  (ticks || []).forEach(tick => {
    if (!tick.value) {
      return
    }
    const value = parseInt(tick.value, 10);
    const p1 = valueToPoint(width, height, margin, value, 1.1)
    const p2 = valueToPoint(width, height, margin, value, 0.88)
    const p3 = {
      x: p1.x - triangleSize * sin(value),
      y: p1.y + triangleSize * cos(value)
    }
    const p4 = {
      x: p1.x + triangleSize * sin(value),
      y: p1.y - triangleSize * cos(value)
    }

    return svg.append('path')
      .attr('d', function () {
        return 'M ' + p3.x + ' ' + p3.y +
          ' L' + p2.x + ' ' + p2.y +
          ' L' + p4.x + ' ' + p4.y +
          ' z';
      })
      .attr('tick', 'custom')
      .attr('fill', 'orange').on("mouseover", function (d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(tick.value + "<br/>" + tick.label)
          .style("left", (d3.event.pageX) - 30 + "px")
          .style("top", (d3.event.pageY) - 60 + "px");
      })
      .on("mouseout", function (d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });;
  });
}

function addText(text, svg, x, y, fontSize) {
  return svg.append("svg:text")
    .attr("x", x)
    .attr("y", y)
    .attr("dy", fontSize / 2)
    .attr("text-anchor", "middle")
    .text(text)
    .style("font-size", fontSize + "px")
    .style("fill", "#333")
    .style("stroke-width", "0px");
}

function addArc(svg, width, margin, thickness, gaugeColor, value) {
  value = value || 0;
  const r = calcR(width, margin);
  return svg.append('path')
    .attr('d', createArc(-90, value, r, thickness))
    .style('stroke', 'black')
    .style('stroke-width', '1')
    .style('fill', gaugeColor)
    .attr('transform', 'translate(' + (margin + r)
    + ',' + (margin + r) + '), scale(1, 1)');
}

function createArc(sa, ea, r, thickness) {
  ea = 1.8 * parseInt(ea, 10) - 90;
  return d3.svg.arc()
    .outerRadius(r)
    .innerRadius(r - thickness)
    .startAngle(d2r(sa))
    .endAngle(d2r(ea));
}

function d2r(d) {
  return d * (Math.PI / 180);
}

function sin(value) {
  return Math.sin(1.8 * value * Math.PI / 180)
}

function cos(value) {
  return Math.cos(1.8 * value * Math.PI / 180)
}

function calcR(width, margin) {
  return (width - 2 * margin) / 2;
}

function valueToPoint(width, height, margin, value, factor) {
  const r = calcR(width, margin);
  return {
    x: width - r * factor * cos(value) - r - margin,
    y: height - r * factor * sin(value),
  };
}

function getConfig(options) {
  return {
    el: options.el,
    fontSize: options.fontSize || DEFAULT_FONT_SIZE,
    margin: options.margin || DEFAULT_MARGIN,
    width: options.width || DEFAULT_WIDTH,
    height: options.height || DEFAULT_HEIGHT,
    thickness: options.thickness || DEFAULT_THICHNESS,
    gaugeColor: options.gaugeColor || DEFAULT_GAUGE_COLOR,
  };
}
