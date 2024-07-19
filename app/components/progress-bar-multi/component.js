import {
  defineProperty,
  computed,
  get,
  observer
} from '@ember/object';
import Component from '@ember/component';
import layout from './template';
import $ from 'jquery';

function toPercent(value, min, max) {
  value = Math.max(min, Math.min(max, value));
  var per = value / (max - min) * 100; // Percent 0-100

  per = Math.floor(per * 100) / 100; // Round to 2 decimal places

  return per;
}

export default Component.extend({
  layout,
  tagName:              'div',
  classNames:           ['progress-bar-multi'],

  values:               null,
  colorKey:             'color',
  labelKey:             'label',
  valueKey:             'value',
  tooltipValues:        null,
  min:                  0,
  max:                  null,
  minPercent:           10,
  zIndex:               null,
  tooltipTemplate:      'tooltip-static',
  tooltipArrayOrString: 'string',

  init() {
    this._super(...arguments);
    let colorKey = this.colorKey;
    let labelKey = this.labelKey;
    let valueKey = this.valueKey;

    let valueDep = `values.@each.{${ colorKey },${ labelKey },${ valueKey }}`;

    defineProperty(this, 'pieces', computed(valueDep, 'max', 'min', 'minPercent', 'values', () => {
      let min = this.min;
      let max = this.max;

      var out = [];

      (this.values || []).forEach((obj) => {
        out.push({
          color: get(obj, colorKey),
          label: get(obj, labelKey),
          value: get(obj, valueKey),
        });
      });

      if ( !max ) {
        max = 100;
        if ( out.length ) {
          max = out.map((x) => x.value).reduce((a, b) => a + b);
        }
      }

      let sum = 0;
      let minPercent = this.minPercent;

      out.forEach((obj) => {
        let per = Math.max(minPercent, toPercent(obj.value, min, max));

        obj.percent = per;
        sum += per;
      });

      // If the sum is bigger than 100%, take it out of the biggest piece.
      if ( sum > 100 ) {
        out.sortBy('percent').reverse()[0].percent -= sum - 100;
      }

      out.forEach((obj) => {
        obj.css = (`width: ${  obj.percent }%`).htmlSafe();
      });

      return out.filter((obj) => obj.percent);
    }));

    valueDep = `tooltipValues.@each.{${ labelKey },${ valueKey }}`;
    defineProperty(this, 'tooltipContent', computed(valueDep, 'labelKey', 'tooltipArrayOrString', 'tooltipValues', 'valueKey', () => {
      let labelKey = this.labelKey;
      let valueKey = this.valueKey;

      var out = [];

      (this.tooltipValues || []).forEach((obj) => {
        if (this.tooltipArrayOrString === 'string') {
          out.push(`${ get(obj, labelKey) }: ${  get(obj, valueKey) }`);
        } else {
          out.push({
            label: get(obj, labelKey),
            value: get(obj, valueKey),
          });
        }
      });


      return this.tooltipArrayOrString === 'string' ?  out.join('\n') : out;
    }));
  },

  didInsertElement() {
    this.zIndexDidChange();
  },

  zIndexDidChange: observer('zIndex', function() {
    $().css('zIndex', this.zIndex || 'inherit');
  }),

});
