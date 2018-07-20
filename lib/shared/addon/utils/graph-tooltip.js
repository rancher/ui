export default function initTooltip(options) {
  const hoverLineGroup = options.svg.append('g')
    .attr('class', 'hover-line');

  const hoverLine = hoverLineGroup
    .append('line')
    .attr('x1', 10).attr('x2', 10)
    .attr('y1', 0)
    .attr('y2', options.height);

  hoverLine.classed('hide', true);

  const tooltip = d3.select(options.el).append('div')
    .attr('class', 'hover-label')
    .style('opacity', 0);

  const params = {
    currentIndex: -1,
    maxPoints:    options.maxPoints,
    duration:     options.duration,
    formatter:    options.formatter,
    margin:       options.margin,
    height:       options.height,
    el:           options.el,
    x:            options.x,
    gradient:     options.gradient,
    series:       [],
    tooltip,
    hoverLine,
  }

  $(options.el).mouseleave(() => handleMouseOutGraph(params)); // eslint-disable-line
  $(options.el).mousemove(event => handleMouseOverGraph(event, params)); // eslint-disable-line

  return {
    update(series) {
      params.series = series;
      if (params.currentIndex > -1) {
        tooltip.html(getTooltipCotent(params));
      }
    }
  }
}

function handleMouseOverGraph(event, params) {
  const margin = params.margin;
  const mouseX = event.offsetX - margin.left;
  const mouseY = event.offsetY - margin.top;
  const width = params.el.parentNode.offsetWidth - margin.left - margin.right;
  const hoverLine = params.hoverLine;
  const tooltip = params.tooltip;

  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < params.height) {
    hoverLine.classed('hide', false);
    hoverLine.attr('x1', mouseX).attr('x2', mouseX)
    tooltip.transition()
      .duration(200)
      .style('opacity', .9);

    const index = Math.round(params.x.invert(mouseX));

    params.currentIndex = index;
    tooltip.html(getTooltipCotent(params))
      .style('left', `${ event.pageX - margin.left - margin.right + 20  }px`)
      .style('top', `${ event.pageY - 70  }px`);
  } else {
    handleMouseOutGraph(params)
  }
}

function formatValue(params) {
  let div = '';

  params.series.forEach((d, i) => {
    const color = params.gradient[i];

    div += `<tr>
              <td>
                <span style='background-color:${ color }'>
                </span>${ d.field.displayName }
              </td>
              <td>
                ${ params.formatter(d.data[params.currentIndex]) }
              </td>
            </tr>`
  })

  return div;
}

function formatSecondsAgo(index, maxPoints, duration) {
  const ago = Math.max(0, maxPoints - index - 1) * duration / 1000;
  const intl = window.l('service:intl');

  if (ago === 0) {
    return intl.t('time.now');
  }

  if (ago >= 60) {
    const min = Math.floor(ago / 60);
    const sec = ago - 60 * min;

    if (sec > 0) {
      return `${ intl.t('time.mins', { mins: min }) }, ${ intl.t('time.secsAgo', { secs: sec }) }}`;
    } else {
      return intl.t('time.minsAgo', { mins: min });
    }
  }

  return intl.t('time.secsAgo', { secs: ago });
}

function getTooltipCotent(params) {
  let div;

  div =
    `<table class="graph-area-tooltip">
      <tbody>
        <tr>
          <th colspan="2">${ formatSecondsAgo(params.currentIndex, params.maxPoints, params.duration) }</th>
        </tr>
        ${ formatValue(params) }
      </tbody>
    </table>`

  return div;
}

function handleMouseOutGraph(params) {
  params.hoverLine.classed('hide', true);
  params.tooltip.transition().duration(200).style('opacity', 0);
  params.currentIndex = -1;
}
