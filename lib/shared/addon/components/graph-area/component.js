import { inject as service } from '@ember/service';
import { get, set, observer } from '@ember/object';
import ThrottledResize from 'shared/mixins/throttled-resize';
import { escapeHtml } from 'shared/utils/util';
import Component from '@ember/component';
import { all } from 'rsvp'
import { theme as THEME } from './theme';
import {
  roundValue,
  formatPercent,
  formatMib,
  formatSecond,
  formatKbps
} from 'shared/utils/util';
import layout from './template';
import $ from 'jquery';

function getFormatter(unit, full = false) {
  switch (unit) {
  case 'seconds':
    return formatSecond;
  case 'pps':
    return (value) => {
      return `${ roundValue(value)  } ${ full ? 'Packets Per Second' : 'Pps' }`
    }
  case 'ops':
    return (value) => {
      return `${ roundValue(value)  } ${ full ? 'Operation Per Second' : 'Ops' }`
    }
  case 'ms':
    return (value) => {
      return `${ roundValue(value)  } ms`
    }
  case 'mcpu':
    return (value) => {
      return `${ roundValue(value)  } mCPU`
    }
  case 'percent':
    return formatPercent;
  case 'bps':
  case 'kbps':
    return formatKbps;
  case 'byte':
    return formatMib;
  default:
    return roundValue;
  }
}

function getConverter(unit) {
  switch (unit) {
  case 'percent':
    return (value) => value * 100;
  case 'mcpu':
    return (value) => value * 1000;
  case 'bps':
    return (value) => value / 1024;
  case 'byte':
    return (value) => value / 1048576;
  default:
    return (value) => value;
  }
}

const LOADING_PARAMS =  {
  text:      '',
  color:     '#3d3d3d',
  textColor: '#3d3d3d',
  maskColor: 'rgba(255, 255, 255, 0.8)',
  zlevel:    0
}

var ECharts = null;

export default Component.extend(ThrottledResize, {
  intl:       service(),
  layout,

  tagName:    'div',
  classNames: ['graph-area'],

  model:  null,
  fields: null,
  chart:  null,

  formatter:   'value',
  needRefresh: false,

  init() {
    this._super(...arguments);

    if ( !ECharts ) {
      all([
          import('echarts/lib/echarts'),
          import('echarts/lib/chart/line'),
          import('echarts/lib/component/tooltip'),
      ]).then( (modules) => {
        ECharts = modules[0].default;
        ECharts.registerTheme('walden', THEME);
        this.didRender();
      });
    }
  },

  willDestroyElement() {
    const chart = get(this, 'chart');

    if ( chart ) {
      chart.clear();
      chart.dispose();
    }
  },

  didRender() {
    if ( ECharts && !get(this, 'chart') ) {
      this.create();
      setTimeout(() => {
        const chart = get(this, 'chart');

        if ( chart ) {
          chart.resize();
        }
      }, 200);
    }
  },

  loadingDidChange: observer('loading', function() {
    const chart = get(this, 'chart');

    if ( chart && get(this, 'loading') ) {
      chart.showLoading(LOADING_PARAMS);
    } else if (chart) {
      chart.hideLoading();
    }
  }),

  dataDidChange: observer('series', function() {
    if ( get(this, 'chart') ) {
      this.draw();
    }
  }),

  onResize() {
    if ( !ECharts || this.isDestroyed || this.isDestroying ) {
      return;
    }

    if ( get(this, 'chart') ) {
      get(this, 'chart').resize();
    }
  },

  create() {
    const chart = ECharts.init($(this.element).find('.content')[0], 'walden');

    set(this, 'chart', chart);
    chart.showLoading(LOADING_PARAMS);
    this.draw();
  },

  draw() {
    const chart = get(this, 'chart');

    if ( !chart ) {
      return;
    }

    const minMax = get(this, 'formatter') === 'percent' ? 100 : null;
    let setMax = true;
    const series = [];
    const fields = (get(this, 'series') || []).filter((serie) => get(serie, 'points.length') > 1).map((serie) => {
      return {
        id:   get(serie, 'name'),
        data: (get(serie, 'points') || []).map((p) => [p[1], getConverter(get(this, 'formatter'))(p[0])])
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
        animation:  false,
        data,
        itemStyle:  { normal: { lineStyle: { width: 1 } } }
      });
    });

    const formatter = getFormatter(get(this, 'formatter'), true);
    let option = {
      tooltip: {
        trigger:   'axis',
        position(pos, params, dom, rect, size) {
          const obj = { top: 60 };

          obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;

          return obj;
        },
        formatter(params) {
          let html = '';

          params.forEach((p, i) => {
            if ( i === 0 ) {
              html = `<div class="text-left">${ p.axisValueLabel }`
            }

            const value = escapeHtml(formatter(p.data[1]));
            let label = escapeHtml(p.seriesName);

            html += `<br><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${ p.color };"></span> ${ label } : ${ value }`;
          });

          html += '</div>';

          return html.htmlSafe();
        }
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
      },
      yAxis:  {
        type:      'value',
        axisLabel: { formatter: getFormatter(get(this, 'formatter')) },
        splitArea: { show: true },
      },
      series,
    };

    if ( setMax && minMax ) {
      option.yAxis.max = minMax;
    }

    chart.clear();
    chart.setOption(option, true);

    chart.hideLoading();
  },
});
