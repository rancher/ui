export default function initGraph(options) {
  const { el, width, height, margin, thickness, fontSize, triangleSize } = getConfig(options);

  const svg = d3.select(el).append('svg')
    .attr('width', width).attr('height', height + margin);

  let value = options.value;
  let ticks = options.ticks;
  const { valuePath, maxPath } = addArcValue(svg, width, margin, thickness, options.value);
  const bottomLine = addBottomLine(svg, width, height);
  let tooltip = addTooltip();
  addTicks(svg, triangleSize, tooltip, width, height, margin, ticks);
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
        value = parseInt(text, 10);
        const r = calcR(width, margin);
        valuePath.attr('d', createArc(-90, value, r, thickness));
      }
    },
    updateTicks(t) {
      ticks = t;
      repaintTicks(svg, triangleSize, tooltip, width, height, margin, ticks);
    },
    fit() {
      fit(svg, el, value, ticks, tooltip, bottomLine, valuePath,
        maxPath, valueLabel, titleLabel, subtitleLabel);
    },
  };
}

function fit(svg, el, value, ticks, tooltip, bottomLine, valuePath, maxPath, valueLabel, titleLabel, subtitleLabel) {
  const { width, height, margin, thickness, fontSize, triangleSize } = getConfig({ el });
  svg.attr('width', width).attr('height', height + margin);
  repaintBottomLine(width, height, bottomLine);
  repaintArc(width, margin, value, thickness, valuePath, maxPath);
  repaintLabels(valueLabel, titleLabel, subtitleLabel, width, height, fontSize);
  repaintTicks(svg, triangleSize, tooltip, width, height, margin, ticks);
}

function repaintTicks(svg, triangleSize, tooltip, width, height, margin, ticks) {
  svg.selectAll('path[tick = "custom"]').remove();
  addTicks(svg, triangleSize, tooltip, width, height, margin, ticks);
}

function repaintBottomLine(width, height, bottomLine) {
  const lineFunction = d3.svg.line()
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .interpolate("linear");
  bottomLine.attr("d", lineFunction([{ "x": 0, "y": height }, { "x": width, "y": height }]))
    .attr("stroke-width", width / 80);
}

function repaintArc(width, margin, value, thickness, valuePath, maxPath) {
  const r = calcR(width, margin);
  valuePath.attr('d', createArc(-90, value, r, thickness))
    .attr('transform', 'translate(' + (margin + r)
    + ',' + (margin + r) + '), scale(1, 1)');
  maxPath.attr('d', createArc(-90, 100, r, thickness))
    .attr('transform', 'translate(' + (margin + r)
    + ',' + (margin + r) + '), scale(1, 1)');
}

function repaintLabels(valueLabel, titleLabel, subtitleLabel, width, height, fontSize) {
  valueLabel.attr("x", width / 2)
    .attr("y", height / 4 + fontSize / 1.2)
    .attr("dy", fontSize / 2)
    .style("font-size", fontSize + "px");
  titleLabel.attr("x", width / 2)
    .attr("y", height / 4 + 2 * fontSize)
    .attr("dy", fontSize / 4)
    .style("font-size", fontSize / 1.5 + "px");
  subtitleLabel.attr("x", width / 2)
    .attr("y", height / 4 + 3 * fontSize)
    .attr("dy", fontSize / 4)
    .style("font-size", fontSize / 2 + "px")
    ;
}

function addTooltip() {
  let tooltip = d3.select('#percent-gauge-tooltip');
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div")
      .attr('class', 'hover-label')
      .attr("class", "percent-gauge-tooltip")
      .attr("id", "percent-gauge-tooltip")
      .style("opacity", 0);
  }
  return tooltip;
}

function addArcValue(svg, width, margin, thickness, value) {
  const valuePath = addArc(svg, width, margin, thickness, 'gauge-value-path', value);
  const maxPath = addArc(svg, width, margin, thickness, 'none', 100);
  return {
    valuePath,
    maxPath,
  };
}

function addLabels(svg, options, width, height, fontSize) {
  return {
    valueLabel: addText(options.value ? `${options.value}%` : '0%', svg, width / 2, height / 4 + fontSize / 1.2, fontSize),
    titleLabel: addText(options.title, svg, width / 2, height / 4 + 2 * fontSize, fontSize / 1.5),
    subtitleLabel: addText(options.subtitle, svg, width / 2, height / 4 + 3 * fontSize, fontSize / 2, fontSize / 18, 1.5),
  }
}

function addBottomLine(svg, width, height) {
  const lineFunction = d3.svg.line()
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .interpolate("linear");

  return svg.append("path")
    .attr("d", lineFunction([{ "x": 0, "y": height }, { "x": width, "y": height }]))
    .attr("class", "gauge-text-stroke")
    .attr("stroke-width", width / 80)
}

function addTicks(svg, triangleSize, tooltip, width, height, margin, ticks) {
  (ticks || []).forEach(tick => {
    if (tick.value !==0 && !tick.value) {
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

    let tr = '';
    tick.labels.forEach(label => {
      tr += `<tr>
                <td>${label}</td>
                <td>${tick.value}%</td>
              </tr>`;
    });

    return svg.append('path')
      .attr('d', function () {
        return 'M ' + p3.x + ' ' + p3.y +
          ' L' + p2.x + ' ' + p2.y +
          ' L' + p4.x + ' ' + p4.y +
          ' z';
      })
      .attr('tick', 'custom')
      .attr('class', 'gauge-tick').on("mouseover", function () {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`<table>
                        <tbody>
                          <tr>
                            <th>${window.l('service:intl').t('clusterDashboard.node')}</th>
                            <th>${window.l('service:intl').t('clusterDashboard.value')}</th>
                          </tr>
                          ${tr}
                        </tbody>
                      </table>`)
          .style("left", (d3.event.pageX) - 30 + "px")
          .style("top", (d3.event.pageY) - 30*(tick.labels.length + 1) + "px");
      })
      .on("mouseout", function () {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  });
}

function addText(text, svg, x, y, fontSize, bold = 0, space = 0) {
  return svg.append("svg:text")
    .attr("x", x)
    .attr("y", y)
    .attr("dy", fontSize / 2)
    .attr("text-anchor", "middle")
    .text(text)
    .style("font-size", fontSize + "px")
    .attr("class", "gauge-text-fill")
    .style("letter-spacing", `${space}px`);
}

function addArc(svg, width, margin, thickness, gaugeColor, value) {
  value = value || 0;
  const r = calcR(width, margin);
  return svg.append('path')
    .attr('d', createArc(-90, value, r, thickness))
    .style('stroke-width', '1')
    .attr('class', `gauge-text-stroke ${gaugeColor}`)
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
  return Math.sin(1.8 * value * Math.PI / 180);
}

function cos(value) {
  return Math.cos(1.8 * value * Math.PI / 180);
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

function getWidth(el) {
  const width = el.parentNode.offsetWidth;
  return width > 0 ? width : 0;
}

function getConfig(options) {
  const width = getWidth(options.el);
  return {
    el: options.el,
    fontSize: width / 10,
    margin: width / 22,
    width,
    height: width / 2,
    thickness: width / 20,
    triangleSize: width / 40,
  };
}
