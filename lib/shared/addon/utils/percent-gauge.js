export default function initGraph(options) {

  const {
    el, width, height, margin, thickness, fontSize
  } = getConfig(options);

  const svg = d3.select(el).append('svg')
    .attr('width', width)
    .attr('height', height);

  let value = options.value;
  let ticks = options.ticks;
  const { valuePath, maxPath } = addArcValue(svg, width, margin, thickness, options.value);
  let tooltip = addTooltip();

  addTicks(svg, tooltip, width, height, margin, ticks, options.value, thickness);
  const {
    valueLabel, titleLabel, subtitleLabel
  } = addLabels(svg, options, width, height, fontSize);

  return {
    updateTitle(text) {

      titleLabel.text(text);

    },
    updateSubTitle(text) {

      subtitleLabel.text(text);

    },
    updateValue(text) {

      text = text ? `${ text }%` : '';
      valueLabel.text(text);
      if (text) {

        value = parseInt(text, 10);
        const r = calcR(width, margin);

        valuePath.attr('d', createArc(-135, value, r, thickness));

      }

    },
    updateTicks(t) {

      ticks = t;
      repaintTicks(svg, tooltip, width, height, margin, ticks, value, thickness);

    },
    fit() {

      fit(svg, el, value, ticks, tooltip, valuePath,
        maxPath, valueLabel, titleLabel, subtitleLabel);

    },
  };

}

function fit(svg, el, value, ticks, tooltip, valuePath, maxPath, valueLabel, titleLabel, subtitleLabel) {

  const {
    width, height, margin, thickness, fontSize
  } = getConfig({ el });

  svg.attr('width', width).attr('height', height);
  repaintArc(width, margin, value, thickness, valuePath, maxPath);
  repaintLabels(valueLabel, titleLabel, subtitleLabel, width, height, fontSize);
  repaintTicks(svg, tooltip, width, height, margin, ticks, value, thickness);

}

function repaintTicks(svg, tooltip, width, height, margin, ticks, value, thickness) {

  svg.selectAll('path[tick = "custom"]').remove();
  svg.selectAll('circle[tick = "custom"]').remove();
  addTicks(svg, tooltip, width, height, margin, ticks, value, thickness);

}

function repaintArc(width, margin, value, thickness, valuePath, maxPath) {

  const r = calcR(width, margin);

  valuePath.attr('d', createArc(-135, value, r, thickness))
    .attr('transform', `translate(${  margin + r
    },${  margin + r  }), scale(1, 1)`);
  maxPath.attr('d', createArc(-135, 100, r, thickness))
    .attr('transform', `translate(${  margin + r
    },${  margin + r  }), scale(1, 1)`);

}

function addTooltip() {

  let tooltip = d3.select('#percent-gauge-tooltip');

  if (tooltip.empty()) {

    tooltip = d3.select('body').append('div')
      .attr('class', 'hover-label')
      .attr('class', 'percent-gauge-tooltip')
      .attr('id', 'percent-gauge-tooltip')
      .style('opacity', 0);

  }

  return tooltip;

}

function addArcValue(svg, width, margin, thickness, value) {

  const maxPath = addArc(svg, width, margin, thickness, 'gauge-max-path', 100);
  const valuePath = addArc(svg, width, margin, thickness, 'gauge-value-path', value > 100 ? 100 : value);

  return {
    valuePath,
    maxPath,
  };

}

function getValueLabelY(height, fontSize) {

  return height / 5 + fontSize / 1.2;

}

function getTitleLabelY(height, fontSize) {

  return height / 5 + 1.9 * fontSize;

}

function getSubtitleLabelY(height, fontSize) {

  return height / 5 + 2.5 * fontSize;

}

function addLabels(svg, options, width, height, fontSize) {

  return {
    valueLabel:    addText(options.value ? `${ options.value }%` : '0%', svg, width / 2, getValueLabelY(height, fontSize), fontSize, 'value', 3.5),
    titleLabel:    addText(options.title, svg, width / 2, getTitleLabelY(height, fontSize), fontSize / 3, 'title'),
    subtitleLabel: addText(options.subtitle, svg, width / 2, getSubtitleLabelY(height, fontSize), fontSize / 3, 'subtitle'),
  }

}

function repaintLabels(valueLabel, titleLabel, subtitleLabel, width, height, fontSize) {

  valueLabel.attr('x', width / 2)
    .attr('y', getValueLabelY(height, fontSize))
    .attr('dy', fontSize / 2)
    .style('font-size', `${ fontSize  }px`);
  titleLabel.attr('x', width / 2)
    .attr('y', getTitleLabelY(height, fontSize))
    .attr('dy', fontSize / 6)
    .style('font-size', `${ fontSize / 3  }px`);
  subtitleLabel.attr('x', width / 2)
    .attr('y', getSubtitleLabelY(height, fontSize))
    .attr('dy', fontSize / 6)
    .style('font-size', `${ fontSize / 3  }px`);

}

function addTicks(svg, tooltip, width, height, margin, ticks, currentValue, thickness) {

  let max;
  let min;

  (ticks || []).forEach((tick) => {

    if (tick.value !== 0 && !tick.value) {

      return

    }
    const value = parseInt(tick.value, 10);

    max = (max === undefined || value > max) ? value : max;
    min = (min === undefined || value < min) ? value : min;
    const point = valueToPoint(width, height, margin, value, thickness);

    if (ticks.length > 1) {

      let tr = '';

      tick.labels.forEach((label) => {

        tr += `<tr>
                  <td>${ label }</td>
                  <td>${ tick.value }%</td>
                </tr>`;

      });

      svg.append('circle').attr('tick', 'custom')
        .attr('class', `gauge-circle-fill`)
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', 3);

      const tp = svg.append('circle').attr('tick', 'custom')
        .attr('class', `gauge-none-fill`)
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', 30);

      tp.on('mouseover', () => {

        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        tooltip.html(`<table>
                        <tbody>
                          <tr>
                            <th>${ window.l('service:intl').t('clusterDashboard.node') }</th>
                            <th>${ window.l('service:intl').t('clusterDashboard.value') }</th>
                          </tr>
                          ${ tr }
                        </tbody>
                      </table>`)
          .style('left', `${ (d3.event.pageX) - 30  }px`)
          .style('top', `${ (d3.event.pageY) - 30 * (tick.labels.length + 1)  }px`);

      }).on('mouseout', () => {

        tooltip.transition()
          .duration(500)
          .style('opacity', 0);

      });

    }

  });


  if (ticks && ticks.length > 1) {

    const point = valueToPoint(width, height, margin, currentValue, thickness);

    svg.append('circle').attr('tick', 'custom')
      .attr('class', `gauge-circle-fill`)
      .attr('cx', point.x)
      .attr('cy', point.y)
      .attr('r', 5);
    svg.append('circle').attr('tick', 'custom')
      .attr('class', `gauge-tick-path`)
      .style('stroke-width', '2')
      .attr('cx', point.x)
      .attr('cy', point.y)
      .attr('r', 8);

    const rangePath = addArc(svg, width, margin, thickness, 'gauge-tick-path', max, min, 2);

    rangePath.attr('tick', 'custom');

  }

}

function addText(text, svg, x, y, fontSize, labelType, bold = 0) {

  return svg.append('svg:text')
    .attr('x', x)
    .attr('y', y)
    .attr('dy', fontSize / 2)
    .attr('text-anchor', 'middle')
    .text(text)
    .style('font-size', `${ fontSize  }px`)
    .attr('class', `gauge-${ labelType }-fill`)
    .style('stroke-width', `${ bold }px`);

}

function addArc(svg, width, margin, thickness, gaugeColor, value, start = 0, strokeWidth = 1) {

  value = value || 0;
  const r = calcR(width, margin);

  return svg.append('path')
    .attr('d', createArc(-135, value, r, thickness, start))
    .style('stroke-width', strokeWidth)
    .attr('class', `gauge-text-stroke ${ gaugeColor }`)
    .attr('transform', `translate(${  margin + r
    },${  margin + r  }), scale(1, 1)`);

}

function createArc(sa, ea, r, thickness, start = 0) {

  ea = 2.7 * parseInt(ea, 10) - 135;
  sa = 2.7 * parseInt(start, 10) - 135;

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

  return Math.sin((45 - (2.7 * value)) * Math.PI / 180);

}

function cos(value) {

  return Math.cos((45 - (2.7 * value)) * Math.PI / 180);

}

function calcR(width, margin) {

  return (width - 2 * margin) / 2;

}

function valueToPoint(width, height, margin, value, thickness) {

  const r = calcR(width, margin) - (thickness / 2);

  return {
    x: width - r * cos(value) - r - margin - (thickness / 2),
    y: height - r - margin + r * sin(value) - (thickness / 2),
  };

}

function getWidth(el) {

  const width = el.parentNode.offsetWidth;

  return width > 0 ? width : 0;

}

function getConfig(options) {

  const width = getWidth(options.el);

  return {
    el:        options.el,
    fontSize:  width / 7,
    margin:    width / 22,
    width,
    height:    width,
    thickness: width / 12,
  };

}
