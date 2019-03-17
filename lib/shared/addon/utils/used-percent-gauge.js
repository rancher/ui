import { select, event } from 'd3';
import {
  getConfig, addArc, valueToPoint, addText, calcR, createArc
} from 'shared/utils/percent-gauge';

const OUT_RING_MARGIN = 3

export default function initGraph(options) {
  const {
    el, width, height, margin, thickness, fontSize
  } = getConfig(options);

  const svg = select(el).append('svg')
    .attr('width', width).attr('height', height);

  let {
    value, ticks, live = 0, liveTicks, maxValue = 100, maxWheel
  } = options

  let currentLive = 0
  let currentLiveTicks = []
  let currentMaxValue = maxValue
  let currentMaxWheel = maxWheel

  const {
    valuePath, maxPath, liveMaxPath, liveValuePath
  } = addArcValue(svg, width, margin, thickness, options.value, options, live);
  let tooltip = addTooltip();

  addTicks(svg, tooltip, width, height, margin, ticks, options.value, thickness, liveTicks, live, currentMaxValue, currentMaxWheel);
  const {
    valueLabel, titleLabel, subtitleLabel, liveLabel, reservedLabel
  } = addLabels(svg, options, width, height, fontSize);

  return {
    updateTitle(text) {
      titleLabel.text(text);
    },
    updateSubTitle(text) {
      subtitleLabel.text(text);
    },
    updateLiveLabel(text) {
      liveLabel.text(text);
    },
    updateValue(text, live, maxValue, maxWheel) {
      live = live ? `${ live }%` : '';
      valueLabel.text(live);
      const r = calcR(width, margin);
      const outR = calcR(width, OUT_RING_MARGIN)

      currentMaxWheel = maxWheel

      if (maxValue) {
        currentMaxValue = maxValue
        if (maxWheel === 'outer') {
          liveMaxPath.attr('d', createArc(-135, maxValue, r, thickness));
          maxPath.attr('d', createArc(-135, 100, outR, Math.round(thickness / 2)));
        } else {
          maxPath.attr('d', createArc(-135, maxValue, outR, Math.round(thickness / 2)));
          liveMaxPath.attr('d', createArc(-135, 100, r, thickness));
        }
      }

      if (text) {
        value = parseInt(text, 10);
        const percent = maxWheel === 'inner' ? multiMaxPercent(value, currentMaxValue) : value

        valuePath.attr('d', createArc(-135, percent, outR, Math.round(thickness / 2)));
      }

      if (live) {
        currentLive = parseInt(live, 10)
        const percent = maxWheel === 'outer' ? multiMaxPercent(currentLive, currentMaxValue) : currentLive

        liveValuePath.attr('d', createArc(-135, percent, r, thickness));
      }
    },
    updateTicks(t, liveTicks, live, maxValue, maxWheel) {
      ticks = t;
      currentLiveTicks = liveTicks
      currentMaxWheel = maxWheel
      repaintTicks(svg, tooltip, width, height, margin, ticks, value, thickness, live, liveTicks, maxValue, maxWheel);
    },
    fit() {
      fit(svg, el, value, ticks, tooltip, valuePath,
        maxPath, valueLabel, titleLabel, subtitleLabel, liveMaxPath, liveValuePath, liveLabel, currentLive, currentLiveTicks, currentMaxValue, reservedLabel, currentMaxWheel);
    },
  };
}

function fit(svg, el, value, ticks, tooltip, valuePath, maxPath, valueLabel, titleLabel, subtitleLabel, liveMaxPath, liveValuePath, liveLabel, live, liveTicks, currentMaxValue, reservedLabel, currentMaxWheel) {
  const {
    width, height, margin, thickness, fontSize
  } = getConfig({ el });

  svg.attr('width', width).attr('height', height);
  repaintArc(width, margin, value, thickness, valuePath, maxPath, liveMaxPath, liveValuePath, live, currentMaxValue, currentMaxWheel);
  repaintLabels(valueLabel, titleLabel, subtitleLabel, width, height, fontSize, liveLabel, reservedLabel);
  repaintTicks(svg, tooltip, width, height, margin, ticks, value, thickness, live, liveTicks, currentMaxValue, currentMaxWheel);
}

function repaintTicks(svg, tooltip, width, height, margin, ticks, value, thickness, live, liveTicks, currentMaxValue, currentMaxWheel) {
  svg.selectAll('path[tick = "custom"]').remove();
  svg.selectAll('circle[tick = "custom"]').remove();
  addTicks(svg, tooltip, width, height, margin, ticks, value, thickness, liveTicks, live, currentMaxValue, currentMaxWheel);
}

function repaintArc(width, margin, value, thickness, valuePath, maxPath, liveMaxPath, liveValuePath, live, currentMaxValue, currentMaxWheel) {
  const r = calcR(width, margin);

  const outR = calcR(width, OUT_RING_MARGIN)

  if (currentMaxWheel === 'inner') {
    liveValuePath.attr('d', createArc(-135, live, r, thickness))
      .attr('transform', `translate(${  margin + r
      },${  margin + r  }), scale(1, 1)`);
    liveMaxPath.attr('d', createArc(-135, 100, r, thickness))
      .attr('transform', `translate(${  margin + r
      },${  margin + r  }), scale(1, 1)`);
    maxPath.attr('d', createArc(-135, currentMaxValue, outR, Math.round(thickness / 2)))
      .attr('transform', `translate(${  margin + r
      },${  margin + r  }), scale(1, 1)`);
    valuePath.attr('d', createArc(-135, multiMaxPercent(value, currentMaxValue), outR, Math.round(thickness / 2)))
      .attr('transform', `translate(${  margin + r
      },${  margin + r  }), scale(1, 1)`);
  } else {
    liveValuePath.attr('d', createArc(-135, multiMaxPercent(live, currentMaxValue), r, thickness))
      .attr('transform', `translate(${  margin + r
      },${  margin + r  }), scale(1, 1)`);
    liveMaxPath.attr('d', createArc(-135, currentMaxValue, r, thickness))
      .attr('transform', `translate(${  margin + r
      },${  margin + r  }), scale(1, 1)`);
    maxPath.attr('d', createArc(-135, 100, outR, Math.round(thickness / 2)))
      .attr('transform', `translate(${  margin + r
      },${  margin + r  }), scale(1, 1)`);
    valuePath.attr('d', createArc(-135, value, outR, Math.round(thickness / 2)))
      .attr('transform', `translate(${  margin + r
      },${  margin + r  }), scale(1, 1)`);
  }
}

function addTooltip() {
  let tooltip = select('#percent-gauge-tooltip');

  if (tooltip.empty()) {
    tooltip = select('body').append('div')
      .attr('class', 'hover-label')
      .attr('class', 'percent-gauge-tooltip')
      .attr('id', 'percent-gauge-tooltip')
      .style('opacity', 0);
  }

  return tooltip;
}

function addArcValue(svg, width, margin, thickness, value, options, live) {
  const { maxValue, maxWheel } = options
  const liveMaxPath = addArc(svg, width, margin, thickness, 'gauge-max-path', maxWheel === 'inner' ? 100 : maxValue);
  const liveValuePath = addArc(svg, width, margin, thickness, 'gauge-live-value-path', maxWheel === 'inner' ? live : multiMaxPercent(live, maxValue));
  const maxPath = addArc(svg, width, OUT_RING_MARGIN, Math.round(thickness / 2), 'gauge-max-path', maxWheel === 'outer' ? 100 : maxValue);
  const valuePath = addArc(svg, width, OUT_RING_MARGIN, Math.round(thickness / 2), 'gauge-value-path', maxWheel === 'outer' ? value : multiMaxPercent(value, maxValue));

  return {
    valuePath,
    maxPath,
    liveMaxPath,
    liveValuePath,
  };
}

function getValueLabelY(height, fontSize) {
  return height / 5 + fontSize / 1.2;
}

function getLiveLabelY(height, fontSize) {
  return height / 5 + 1.7 * fontSize;
}

function getReservedLabelY(height, fontSize) {
  return height / 5 + 2.5 * fontSize;
}

function getSubtitleLabelY(height, fontSize) {
  return height / 5 + 3.1 * fontSize;
}

function getTitleLabelY(height, fontSize) {
  return height / 5 + 4.3 * fontSize;
}

function addLabels(svg, options, width, height, fontSize) {
  return {
    valueLabel:    addText(options.value ? `${ options.value }%` : '0%', svg, width / 2, getValueLabelY(height, fontSize), fontSize, 'usedPercent', 3.5),
    reservedLabel:    addText(options.value ? `${ options.value }%` : '0%', svg, width / 2, getReservedLabelY(height, fontSize), fontSize / 2, 'reservedPercent', 2),
    titleLabel:    addText(options.title, svg, width / 2, getTitleLabelY(height, fontSize), fontSize / 3, 'title'),
    subtitleLabel: addText(options.subtitle, svg, width / 2, getSubtitleLabelY(height, fontSize), fontSize / 3, 'subtitle'),
    liveLabel:     addText(options.liveTitle, svg, width / 2, getLiveLabelY(height, fontSize), fontSize / 3, 'liveLabel'),
  }
}

function repaintLabels(valueLabel, titleLabel, subtitleLabel, width, height, fontSize, liveLabel, reservedLabel) {
  valueLabel.attr('x', width / 2)
    .attr('y', getValueLabelY(height, fontSize))
    .attr('dy', fontSize / 2)
    .style('font-size', `${ fontSize  }px`);
  reservedLabel.attr('x', width / 2)
    .attr('y', getReservedLabelY(height, fontSize))
    .attr('dy', fontSize / 4)
    .style('font-size', `${ fontSize / 2  }px`);
  titleLabel.attr('x', width / 2)
    .attr('y', getTitleLabelY(height, fontSize))
    .attr('dy', fontSize / 6)
    .style('font-size', `${ fontSize / 3  }px`);
  subtitleLabel.attr('x', width / 2)
    .attr('y', getSubtitleLabelY(height, fontSize))
    .attr('dy', fontSize / 6)
    .style('font-size', `${ fontSize / 3  }px`);
  liveLabel.attr('x', width / 2)
    .attr('y', getLiveLabelY(height, fontSize))
    .attr('dy', fontSize / 6)
    .style('font-size', `${ fontSize / 3  }px`);
}

function addTicks(svg, tooltip, width, height, margin, ticks, currentValue, thickness, liveTicks = [], live, currentMaxValue, currentMaxWheel) {
  let max;
  let min;
  let liveMax;
  let liveMin;


  (ticks || []).forEach((tick) => {
    if (tick.value !== 0 && !tick.value) {
      return
    }
    const value = parseInt(tick.value, 10);

    max = (max === undefined || value > max) ? value : max;
    min = (min === undefined || value < min) ? value : min;
    const percent = currentMaxWheel === 'inner' ? multiMaxPercent(value, currentMaxValue) : value
    const point = valueToPoint(width, height, OUT_RING_MARGIN, percent, thickness / 2);

    if (ticks.length > 1) {
      let tr = '';

      tick.labels.forEach((label) => {
        tr += `<tr>
                  <td>${ label }</td>
                  <td>${ tick.value }%</td>
                </tr>`;
      });

      svg.append('circle').attr('tick', 'custom').attr('class', `gauge-circle-fill`).attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', 3);

      const tp = svg.append('circle').attr('tick', 'custom').attr('class', `gauge-none-fill`).attr('cx', point.x)
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
                            <th>${ window.l('service:intl').t('clusterDashboard.reserved') }</th>
                          </tr>
                          ${ tr }
                        </tbody>
                      </table>`)
          .style('left', `${ (event.pageX) - 30  }px`)
          .style('top', `${ (event.pageY) - 30 * (tick.labels.length + 1)  }px`);
      }).on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
    }
  });

  (liveTicks || []).map((tick) => {
    if (tick.value !== 0 && !tick.value) {
      return
    }
    const value = parseInt(tick.value, 10);

    liveMax = (liveMax === undefined || value > liveMax) ? value : liveMax;
    liveMin = (liveMin === undefined || value < liveMin) ? value : liveMin;
  });

  (liveTicks || []).map((tick) => {
    if (tick.value !== 0 && !tick.value) {
      return
    }
    const value = parseInt(tick.value, 10);

    if ((value !== liveMax && value !== liveMin) || liveMax === liveMin) {
      return
    }
    const percent = currentMaxWheel === 'outer' ? multiMaxPercent(value, currentMaxValue) : value
    const point = valueToPoint(width, height, margin, percent, thickness);

    if (liveTicks.length > 1) {
      let tr = '';

      tr += `<tr>
                <td>${ tick.label }</td>
                <td>${ tick.value }%</td>
              </tr>`;

      svg.append('circle').attr('tick', 'custom').attr('class', `gauge-circle-fill`).attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', 3);

      const tp = svg.append('circle').attr('tick', 'custom').attr('class', `gauge-none-fill`).attr('cx', point.x)
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
                            <th>${ window.l('service:intl').t('clusterDashboard.used') }</th>
                          </tr>
                          ${ tr }
                        </tbody>
                      </table>`)
          .style('left', `${ (event.pageX) - 30  }px`)
          .style('top', `${ (event.pageY) - 30 * 2  }px`);
      }).on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
    }
  });

  if (liveTicks && liveTicks.length > 1 && (liveMax - liveMin >= 1)) {
    const maxPercent = currentMaxWheel === 'inner' ? liveMax : multiMaxPercent(liveMax, currentMaxValue)
    const minPercent = currentMaxWheel === 'inner' ? liveMin : multiMaxPercent(liveMin, currentMaxValue)
    const rangePath = addArc(svg, width, margin, thickness, 'gauge-tick-path', maxPercent, minPercent, 2);

    rangePath.attr('tick', 'custom');
  }

  if (ticks && ticks.length > 1) {
    const maxPercent = currentMaxWheel === 'outer' ? max : multiMaxPercent(max, currentMaxValue)
    const minPercent = currentMaxWheel === 'outer' ? min : multiMaxPercent(min, currentMaxValue)
    const rangePath = addArc(svg, width, OUT_RING_MARGIN, thickness / 2, 'gauge-tick-path', maxPercent, minPercent, 2);

    rangePath.attr('tick', 'custom');
  }
}

function multiMaxPercent(value, maxValue = 100) {
  return Math.round(value * maxValue / 100)
}