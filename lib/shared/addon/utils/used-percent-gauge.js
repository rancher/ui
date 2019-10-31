import { select, event } from 'd3';
import {
  getConfig, addArc, valueToPoint, addText, calcR, createArc, getRange
} from 'shared/utils/percent-gauge';

const OUT_RING_MARGIN = 3

export default function initGraph(options) {
  const {
    el, width, height, margin, thickness, fontSize
  } = getConfig(options);

  const svg = select(el).append('svg')
    .attr('width', width).attr('height', height);

  let {
    value, ticks, live = 0, liveTicks, maxValue = 100
  } = options

  let currentLive = live
  let currentLiveTicks = liveTicks
  let currentMaxValue = maxValue

  const {
    valuePath, maxPath, liveMaxPath, liveValuePath
  } = addArcValue(svg, width, margin, thickness, options.value, options, live);
  let tooltip = addTooltip();

  addTicks(svg, tooltip, width, height, margin, ticks, options.value, thickness, liveTicks, live, currentMaxValue);
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
    updateValue(reserved, live, maxValue) {
      const {
        width, height, margin, thickness
      } = getConfig({ el });

      svg.attr('width', width).attr('height', height);

      live = (live || live === 0) ? `${ live }%` : '';
      reserved = (reserved || reserved === 0) ? `${ reserved }%` : '';
      valueLabel.text(live);
      reservedLabel.text(reserved);

      const r = calcR(width, margin);
      const outR = calcR(width, OUT_RING_MARGIN)

      if (maxValue) {
        currentMaxValue = maxValue
        maxPath.attr('d', createArc(-135, maxValue, outR, Math.round(thickness / 2)));
      }

      if (reserved) {
        value = parseInt(reserved, 10);

        valuePath.attr('d', createArc(-135, multiMaxPercent(value, currentMaxValue), outR, Math.round(thickness / 2)));
      }

      if (live) {
        currentLive = parseInt(live, 10)

        liveValuePath.attr('d', createArc(-135, currentLive, r, thickness));
      }
    },
    updateTicks(t, liveTicks, live, maxValue) {
      ticks = t;
      currentLiveTicks = liveTicks
      repaintTicks(svg, tooltip, width, height, margin, ticks, value, thickness, live, liveTicks, maxValue);
    },
    fit() {
      fit(svg, el, value, ticks, tooltip, valuePath,
        maxPath, valueLabel, titleLabel, subtitleLabel, liveMaxPath, liveValuePath, liveLabel, currentLive, currentLiveTicks, currentMaxValue, reservedLabel);
    },
  };
}

function fit(svg, el, value, ticks, tooltip, valuePath, maxPath, valueLabel, titleLabel, subtitleLabel, liveMaxPath, liveValuePath, liveLabel, live, liveTicks, currentMaxValue, reservedLabel) {
  const {
    width, height, margin, thickness, fontSize
  } = getConfig({ el });

  svg.attr('width', width).attr('height', height);
  repaintArc(width, margin, value, thickness, valuePath, maxPath, liveMaxPath, liveValuePath, live, currentMaxValue);
  repaintLabels(valueLabel, titleLabel, subtitleLabel, width, height, fontSize, liveLabel, reservedLabel);
  repaintTicks(svg, tooltip, width, height, margin, ticks, value, thickness, live, liveTicks, currentMaxValue);
}

function repaintTicks(svg, tooltip, width, height, margin, ticks, value, thickness, live, liveTicks, currentMaxValue) {
  svg.selectAll('path[tick = "custom"]').remove();
  svg.selectAll('circle[tick = "custom"]').remove();
  addTicks(svg, tooltip, width, height, margin, ticks, value, thickness, liveTicks, live, currentMaxValue);
}

function repaintArc(width, margin, value, thickness, valuePath, maxPath, liveMaxPath, liveValuePath, live, currentMaxValue) {
  const r = calcR(width, margin);

  const outR = calcR(width, OUT_RING_MARGIN)

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
  const liveMaxPath = addArc(svg, width, margin, thickness, 'gauge-max-path', 100);
  const liveValuePath = addArc(svg, width, margin, thickness, 'gauge-live-value-path', live > 100 ? 100 : live);
  const maxPath = addArc(svg, width, OUT_RING_MARGIN, Math.round(thickness / 2), 'gauge-max-path', options.maxValue);
  const valuePath = addArc(svg, width, OUT_RING_MARGIN, Math.round(thickness / 2), 'gauge-value-path', value > 100 ? 100 : value);

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
    valueLabel:    addText(options.live ? `${ options.live }%` : '0%', svg, width / 2, getValueLabelY(height, fontSize), fontSize, 'usedPercent', 3.5),
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

function addTicks(svg, tooltip, width, height, margin, ticks, currentValue, thickness, liveTicks = [], live, currentMaxValue) {
  let { max, min } = getRange(ticks);
  let liveMax = getRange(liveTicks).max;
  let liveMin = getRange(liveTicks).min;


  (ticks || []).forEach((tick) => {
    if (tick.value !== 0 && !tick.value) {
      return
    }

    let value = parseInt(tick.value, 10);

    if ((value !== max && value !== min) || max === min) {
      return
    }
    if (min === value && value === currentValue && value !== 0) {
      value -= 1
    }
    if (max === value && value === currentValue && value !== 100) {
      value += 1
    }

    const point = valueToPoint(width, height, OUT_RING_MARGIN, multiMaxPercent(value, currentMaxValue), thickness / 2);

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
        .attr('r', thickness / 4);

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
    let value = parseInt(tick.value, 10);

    if ((value !== liveMax && value !== liveMin) || liveMax === liveMin) {
      return
    }
    if (liveMin === value && value === live && value !== 0) {
      value -= 1
    }
    if (liveMax === value && value === live && value !== 100) {
      value += 1
    }
    const point = valueToPoint(width, height, margin, value, thickness);

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
        .attr('r', thickness / 2);

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
    let rangePath

    if (liveMin === live && liveMin !== 0) {
      liveMin -= 1
    }
    if (liveMax === live && liveMax !== 100) {
      liveMax += 1
    }
    rangePath = addArc(svg, width, margin, thickness, 'gauge-tick-path', liveMax, liveMin, 2);

    rangePath.attr('tick', 'custom');
  }

  if (ticks && ticks.length > 1 && (max - min >= 1)) {
    let rangePath

    if (min === currentValue && min !== 0) {
      min -= 1
    }
    if (max === currentValue && max !== 100) {
      max += 1
    }
    rangePath = addArc(svg, width, OUT_RING_MARGIN, thickness / 2, 'gauge-tick-path', multiMaxPercent(max, currentMaxValue), multiMaxPercent(min, currentMaxValue), 2);

    rangePath.attr('tick', 'custom');
  }
}

function multiMaxPercent(value, maxValue = 100) {
  return Math.round(value * maxValue / 100)
}