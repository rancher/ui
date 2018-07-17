import { GRADIENT_COLORS } from 'shared/components/svg-gradients/component';
import {
  formatPercent,
  formatMib,
  formatKbps
} from 'shared/utils/util';
import initTooltip from 'shared/utils/graph-tooltip';

const FORMATTERS = {
  value:   (value) => value,
  percent: formatPercent,
  mib:     formatMib,
  kbps:    formatKbps
};
const DEFAULT_MARGIN = {
  top:    5,
  right:  20,
  bottom: 5,
  left:   75
};
const DEFAULT_MAX_POINTS = 60;
const DEFAULT_DURATION = 1000;
const DEFAULT_Y_TICKS = 5;
const DEFAULT_HEIGHT = 190;
const DEFAULT_INTERVAL = 1000;

export default function initGraph(options) {
  const {
    el, margin, width, height, yTicks, duration,
    maxPoints, formatter, fields, gradient, interpolate, min, query, interval
  } = getConfig(options);

  const graph = d3.select(el).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const svg = graph.append('g').attr('transform', `translate(${  margin.left  },${  margin.top  })`);

  const x = d3.scale.linear().domain([0, maxPoints - 1]).range([0, width]);
  const y = d3.scale.linear().domain([0, 1]).range([height, 0]);

  const line = d3.svg.line().interpolate(interpolate)
    .defined((d) => typeof d === 'number')
    .x((d, i) => x(i))
    .y((d) => y(d));
  const area = d3.svg.area().interpolate(interpolate)
    .defined((d) => typeof d === 'number')
    .x((d, i) => x(i))
    .y0(height)
    .y1((d) => y(d));

  const yAxis = d3.svg.axis().scale(y).orient('left')
    .ticks(yTicks)
    .tickFormat(FORMATTERS[formatter]);
  const yAxisG = svg.append('g').attr('class', 'y axis').call(yAxis);

  const clipPath = svg.append('defs').append('clipPath').attr('id', 'clip')
    .append('rect')
    .attr('width', width)
    .attr('height', height);

  const stripes = drawStripes(svg, width, y, yTicks);

  const series = getSeries(fields, svg, gradient);

  const tooltip = initTooltip({
    el,
    svg,
    height,
    margin,
    maxPoints,
    duration,
    formatter: FORMATTERS[formatter],
    x,
    gradient:  GRADIENT_COLORS[gradient]
  });

  const params = {
    svg,
    el,
    x,
    y,
    min,
    margin,
    height,
    line,
    area,
    yAxisG,
    yAxis,
    yTicks,
    stripes,
    options,
    maxPoints,
    query,
    series,
    duration,
    tooltip,
  }

  let intervalId

  return {
    start() {
      render(params);
      intervalId = setInterval(() => {
        render(params);
      }, interval);
    },
    fit() {
      fit({
        el,
        x,
        margin,
        graph,
        clipPath,
        stripes: params.stripes
      });
    },
    destory() {
      clearInterval(intervalId);
    }
  };
}

function render(params) {
  let all = [];
  const series = [];

  params.series.forEach((serie) => {
    const data = query(params.maxPoints, params.query, serie.field);

    all = all.concat(data)
    series.push({
      field:     serie.field,
      lineChart: serie.lineChart,
      areaChart: serie.areaChart,
      data
    })
  })

  updateTooltip(series, params)
  updateAxis(all.filter((d) => d !== null), params)
  updateLines(series, params)
}

function fit(params) {
  const margin = params.margin;
  const width = getWidth(params.el, margin);

  params.x.range([0, width]);
  params.graph.attr('width', width + margin.left + margin.right);
  params.clipPath.attr('width', width);
  params.stripes.attr('width', width);
}

function query(maxPoints, query, field) {
  let data = query(field.key) || []

  if (data.length < maxPoints) {
    const len = data.length

    for (let i = 0; i < maxPoints - len; i++) {
      data.unshift(null)
    }
  } else if (data.length > maxPoints) {
    data = data.slice(-1 * maxPoints);
  }

  return data;
}

function adjustMax(dataMax, options) {
  let optMinMax = options.minMax;
  let optMax = options.max;
  let optScaleDown = options.scaleDown;
  let observedMax = options.observedMax;
  let out = dataMax;

  if (optMax) {
    out = optMax;
  } else if (optMinMax) {
    out = Math.max(optMinMax, out);
  }

  if (observedMax && !optScaleDown) {
    out = Math.max(observedMax, out);
  }

  if (!observedMax && out > 0 && options.maxDoubleInital) {
    out *= 2;
  }
  options.observedMax = out;

  return out;
}

function updateTooltip(series, params) {
  params.tooltip.update(series)
}

function updateAxis(all, params) {
  if (all.length === 0) {
    return;
  }
  const min = params.min === null ? d3.min(all) : params.min;
  const max = adjustMax(d3.max(all), params.options);
  const update = params.y.domain()[0] !== min || params.y.domain()[1] !== max

  params.y.domain([min, max]);
  params.y.range([params.height - 2, 2]);
  params.y.rangeRound([params.height - 2, 2]);
  params.yAxisG.call(params.yAxis);
  if (update) {
    updateStripes(params);
  }
}

function updateLines(series, params) {
  series.forEach((serie) => {
    serie.areaChart.attr('d', params.area(serie.data))
    serie.lineChart.attr('d', params.line(serie.data))
  })
}

function drawStripes(svg, width, y, yTicks) {
  return svg.selectAll('rect.y')
    .data(y.ticks(yTicks))
    .enter().append('rect')
    .attr('x', 0)
    .attr('width', width)
    .attr('y', y)
    .attr('height', (d, i) => i === 0 ? 0 : y(y.ticks(yTicks)[i - 1]) - y(d))
    .attr('class', (d, i) => i % 2 === 0 ? 'even' : 'odd')
    .style('fill-opacity', 0.1);
}

function updateStripes(params) {
  params.stripes.remove();
  params.stripes = drawStripes(params.svg, getWidth(params.el, params.margin), params.y, params.yTicks);
}

function getWidth(el, margin) {
  const width = el.parentNode.offsetWidth - margin.left - margin.right

  return width > 0 ? width : 0;
}

function getSeries(fields, svg, gradient) {
  return fields.map((field, i) => {
    return {
      field,
      lineChart: svg.append('g').attr('clip-path', 'url(#clip)')
        .append('path').attr('class', 'line')
        .style('stroke', GRADIENT_COLORS[gradient][i]),
      areaChart: svg.append('g').attr('clip-path', 'url(#clip)')
        .append('path').attr('class', 'area')
        .style('fill', `url(${ window.location.pathname }#${ gradient }-${ i }-gradient)`)
    }
  });
}

function getConfig(options) {
  const el = options.el;
  const chartHeight = options.height || DEFAULT_HEIGHT
  const margin = options.margin || DEFAULT_MARGIN
  const intl = window.l('service:intl');
  const fields = (options.fields || []).map((field) => {
    return {
      key:         field.key,
      displayName: intl.t(field.displayName)
    }
  });

  return {
    el,
    margin,
    width:       getWidth(el, margin),
    height:      chartHeight - margin.top - margin.bottom,
    yTicks:      options.yTicks || DEFAULT_Y_TICKS,
    duration:    options.duration || DEFAULT_DURATION,
    maxPoints:   options.maxPoints || DEFAULT_MAX_POINTS,
    interval:    options.interval || DEFAULT_INTERVAL,
    formatter:   options.formatter || 'value',
    fields,
    gradient:    options.gradient || 'memory',
    interpolate: options.interpolate || 'basis',
    min:         options.min,
    query:       options.query,
  }
}
