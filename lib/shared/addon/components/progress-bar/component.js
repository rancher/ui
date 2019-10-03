import Component from '@ember/component';
import { computed, get, observer } from '@ember/object';
import layout from './template';
import $ from 'jquery';

export default Component.extend({
  layout,

  color:  '',
  min:    0,
  value:  0,
  max:    100,
  zIndex: null,

  didInsertElement() {
    this.percentDidChange();
    this.zIndexDidChange();
  },

  percentDidChange: observer('percent', function() {
    $('.progress-bar').css('width', `${ get(this, 'percent')  }%`);
  }),

  zIndexDidChange: observer('zIndex', function() {
    $().css('zIndex', get(this, 'zIndex') || 'inherit');
  }),

  tooltipContent: computed('percent', function() {
    return `${ get(this, 'percent') } %`;
  }),

  percent: computed('min', 'max', 'value', function() {
    var min   = get(this, 'min');
    var max   = get(this, 'max');
    var value = Math.max(min, Math.min(max, get(this, 'value')));

    var per = value / (max - min) * 100; // Percent 0-100

    per = Math.round(per * 100) / 100; // Round to 2 decimal places

    return per;
  }),

  colorClass: computed('color', function() {
    var color = get(this, 'color');

    if ( !color ) {
      return;
    }

    return `progress-bar-${  color.replace(/^progress-bar-/, '') }`;
  }),

});
