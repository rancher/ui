import Component from '@ember/component';
import ThrottledResize from 'shared/mixins/throttled-resize';
import initGraph from 'ui/utils/percent-gauge';
import layout from './template';
import { observer } from '@ember/object'

export default Component.extend(ThrottledResize, {
  layout,
  tagName: 'div',
  classNames: ['percent-gauge'],
  value: null,
  title: null,
  subtitle: null,
  ticks: null,
  svg: null,

  didInsertElement() {
    this._super(...arguments);
    this.set('svg', initGraph({
      el: this.$()[0],
      value: this.get('value'),
      title: this.get('title'),
      subtitle: this.get('subtitle'),
      ticks: this.get('ticks'),
    }));
  },

  onResize() {
    if (this.get('svg')) {
      this.get('svg').fit();
    }
  },

  updateTitle: observer('title', function() {
    this.get('svg').updateTitle(this.get('title'));
  }),

  updateSubTitle: observer('subtitle', function() {
    this.get('svg').updateSubTitle(this.get('subtitle'));
  }),

  updateValue: observer('value', function() {
    this.get('svg').updateValue(this.get('value'));
  }),

  updateTicks: observer('ticks.@each.{label,value}', function() {
    this.get('svg').updateTicks(this.get('ticks'));
  }),
});
