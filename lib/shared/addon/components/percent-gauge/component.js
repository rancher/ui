import Component from '@ember/component';
import ThrottledResize from 'shared/mixins/throttled-resize';
import initGraph from 'ui/utils/percent-gauge';
import layout from './template';
import { get, set, observer } from '@ember/object'
import { next } from '@ember/runloop';

export default Component.extend(ThrottledResize, {
  layout,
  tagName:    'div',
  classNames: ['percent-gauge'],
  value:      null,
  title:      null,
  subtitle:   null,
  ticks:      null,
  svg:        null,
  ready:      false,

  didInsertElement() {
    this._super(...arguments);
    this.set('svg', initGraph({
      el:       this.element,
      value:    get(this, 'value'),
      title:    get(this, 'title'),
      subtitle: get(this, 'subtitle'),
      ticks:    get(this, 'ticks'),
      mode:     get(this, 'mode'),
    }));

    next(this, () => {
      if ( this.isDestroyed || this.isDestroying ) {
        return
      }

      set(this, 'ready', true);
    });
  },

  updateTitle: observer('title', function() {
    get(this, 'svg').updateTitle(get(this, 'title'));
  }),

  updateSubTitle: observer('subtitle', function() {
    get(this, 'svg').updateSubTitle(get(this, 'subtitle'));
  }),

  updateValue: observer('value', function() {
    get(this, 'svg').updateValue(get(this, 'value'));
  }),

  updateTicks: observer('ticks.@each.{label,value}', function() {
    get(this, 'svg').updateTicks(get(this, 'ticks'));
  }),

  onResize() {
    if ( get(this, 'svg') && get(this, 'ready') ) {
      get(this, 'svg').fit();
    }
  }
});
