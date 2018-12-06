import { inject as service } from '@ember/service';
import { get, observer } from '@ember/object';
import layout from './template';
import moment from 'moment';
import GraphArea from 'shared/components/graph-area/component';
import { htmlSafe } from '@ember/string';

const FORMATTERS = {
  value: (value) => {
    if ( value < 1 ) {
      return Math.round(value * 100) / 100;
    } else if ( value < 10 ) {
      return Math.round(value * 10) / 10;
    } else {
      return Math.round(value);
    }
  },
};

export default GraphArea.extend({
  intl:       service(),
  layout,

  tagName:    'div',
  classNames: ['graph-area'],

  model:  null,
  fields: null,
  chart:  null,

  minMax: null,

  formatter:   'value',
  needRefresh: false,
  series:      null,

  optionChange: observer('series.[]', 'threshold', function() {
    this.draw()
  }),

  draw() {
    const chart = get(this, 'chart');

    if ( !chart ) {
      return;
    }

    const minMax = get(this, 'minMax');
    let setMax = true;
    const series = [];
    const fields = (get(this, 'series') || []).map((serie) => {
      return {
        id:   get(serie, 'name'),
        data: get(serie, 'points').map((p) => [p[1], p[0]])
      }
    });

    fields.forEach((field) => {
      const serie = field.data || [];
      const data = [];

      serie.forEach((d) => {
        if ( minMax && setMax && d[1] > minMax ) {
          setMax = false;
        }
        data.push(d);
      });

      series.push({
        name:       field.id,
        type:       'line',
        showSymbol: false,
        data,
        itemStyle:  { normal: { lineStyle: { width: 1 } } }
      });
    });
    const threshold = get(this, 'threshold')
    const formatter = FORMATTERS[get(this, 'formatter')];

    let minTime
    let maxTime

    series.map((s) => {
      const { data = [] } = s

      if (data.length === 0) {
        return
      }
      const endIndex = data.length - 1
      const _minTime = data[0] && data[0][0]
      const _maxTime = data[endIndex] && data[endIndex][0]

      if (minTime && maxTime) {
        minTime = Math.min(_minTime, minTime)
        maxTime = Math.max(_maxTime, maxTime)
      } else {
        minTime = _minTime
        maxTime = _maxTime
      }
    })

    let option = {
      tooltip: {
        trigger:     'item',
        axisPointer: {
          axis: 'x',
          snap: true,
        },
        formatter(params) {
          let html = '';

          const { seriesName = '' } = params
          const value = formatter(params.data[1]);

          const label = seriesName.slice(0, seriesName.indexOf('{'))
          const body = seriesName.slice(seriesName.indexOf('{') + 1, -1)
          const infos = body.split(', ').map((i = '') => i.replace('=', ': '))

          html = `<div class="text-left">${ moment(params[0]).format('YYYY-MM-DD HH:mm:ss') }`
          html += `<br><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${ params.color };"></span> ${ label } : ${ value }`;
          infos.map((i) => {
            html += `<br><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:transparent;"></span> ${ i }`
          })

          html += '</div>';

          return htmlSafe(html);
        },
      },
      grid:    {
        top:          '10px',
        left:         '30px',
        right:        '30px',
        bottom:       '3%',
        containLabel: true
      },
      xAxis:   {
        type:        'time',
        boundaryGap: false,
        axisPointer: {
          show:           true,
          snap:           true,
          triggerTooltip: false,
        }
      },
      yAxis:  {
        type:      'value',
        axisLabel: { formatter: FORMATTERS[get(this, 'formatter')] },
        splitArea: { show: true },
      },
      series: [...series,
        {
          data:      [[minTime, threshold], [maxTime, threshold]],
          type:      'line',
          id:        'threshold',
          lineStyle: { color: '#f5222d', },
          symbol:    'none',
          name:      'Threshold',
          itemStyle: { color: '#f5222d', },
        }
      ],
    };

    if ( setMax && minMax ) {
      option.yAxis.max = minMax;
    }

    chart.setOption(option, true);

    chart.hideLoading();
  },

});
