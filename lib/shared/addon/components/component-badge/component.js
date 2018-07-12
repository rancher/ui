import Component from '@ember/component';
import ThrottledResize from 'shared/mixins/throttled-resize';
import initGraph from 'ui/utils/component-badge';
import layout from './template';

export default Component.extend(ThrottledResize, {
  layout,
  tagName:    'div',
  classNames: ['mt-10', 'component-badge'],

  component: null,
  healthy:   null,

  svg: null,

  updateHealthStatus: function() {

    this.get('svg').updateHealthStatus(this.get('healthy'));

  }.observes('healthy'),
  didRender() {

    this._super();
    if (!this.get('svg')) {

      this.create();

    }

  },

  create() {

    this.set('svg', initGraph({
      el:        this.$()[0],
      component: this.get('component'),
      healthy:   this.get('healthy'),
    }));

  },

  onResize() {

    if (this.get('svg')) {

      this.get('svg').fit();

    }

  },

});
