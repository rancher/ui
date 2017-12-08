import Component from '@ember/component';
import initGraph from 'ui/utils/percent-gauge';
import layout from './template';

export default Component.extend({
  layout,
  tagName: 'div',
  classNames: ['percent-gauge'],
  value: null,
  title: null,
  subtitle: null,
  ticks: null,
  svg: null,

  create: function () {
    this.set('svg', initGraph({
      el: this.$()[0],
      value: this.get('value'),
      title: this.get('title'),
      subtitle: this.get('subtitle'),
      ticks: this.get('ticks'),
    }));
  },

  didRender() {
    this._super();
    if (!this.get('svg')) {
      this.create();
    }
  },

  updateTitle: function () {
    this.get('svg').updateTitle(this.get('title'));
  }.observes('title'),

  updateSubTitle: function (text) {
    this.get('svg').updateSubTitle(this.get('subtitle'));
  }.observes('subtitle'),

  updateValue: function (text) {
    this.get('svg').updateValue(this.get('value'));
  }.observes('value'),

  updateTicks: function (text) {
    this.get('svg').updateTicks(this.get('ticks'));
  }.observes('ticks.@each.{value,label}'),
});
