import { defineProperty, computed, get } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

function toPercent(value, min, max) {
  value = Math.max(min, Math.min(max, value));
  var per = value / (max - min) * 100; // Percent 0-100

  per = Math.floor(per * 100) / 100; // Round to 2 decimal places

  return per;
}

export default Component.extend({
  layout,
  tagName:    'div',
  classNames: ['progress-bar-multi'],

  values:        null,
  colorKey:      'color',
  labelKey:      'label',
  valueKey:      'value',
  tooltipValues: null,
  min:           0,
  max:           null,
  minPercent:    10,
  zIndex:        null,

  init() {
    this._super(...arguments);
    let colorKey = this.get('colorKey');
    let labelKey = this.get('labelKey');
    let valueKey = this.get('valueKey');

    let valueDep = `values.@each.{${ colorKey },${ labelKey },${ valueKey }}`;

    defineProperty(this, 'pieces', computed('min', 'max', valueDep, () => {
      let min = this.get('min');
      let max = this.get('max');

      var out = [];

      (this.get('values') || []).forEach((obj) => {
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
      let minPercent = this.get('minPercent');

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

      return out;
    }));

    valueDep = `tooltipValues.@each.{${ labelKey },${ valueKey }}`;
    defineProperty(this, 'tooltipContent', computed(valueDep, () => {
      let labelKey = this.get('labelKey');
      let valueKey = this.get('valueKey');

      var out = [];

      (this.get('tooltipValues') || []).forEach((obj) => {
        out.push(`${ get(obj, labelKey) }: ${  get(obj, valueKey) }`);
      });

      return out.join('\n');
    }));
  },

  didInsertElement() {
    this.zIndexDidChange();
  },
  zIndexDidChange: function() {
    this.$().css('zIndex', this.get('zIndex') || 'inherit');
  }.observes('zIndex'),

});
