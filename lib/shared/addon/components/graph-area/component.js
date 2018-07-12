import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ThrottledResize from 'shared/mixins/throttled-resize';
import initGraph from 'ui/utils/graph-area';
import layout from './template';

export default Component.extend(ThrottledResize, {
  intl:       service(),
  layout,
  tagName:    'div',
  classNames: ['graph-area'],

  model:  null,
  fields: null,

  min:             0,
  minMax:          null,  // lower bound on how small automatic max can be
  max:             null,  // set an explicit max
  maxDoubleInital: false, // if true, set max to double the initial non-zero data point
  scaleDown:       false, // if true, max is allowed to go back down.  If false it can only go up.

  gradient: null,

  formatter: 'value',
  svg:       null,

  didRender() {

    this._super();
    if (this.get('fields.length') > 0 && !this.get('svg')) {

      this.create();
      setTimeout(() => {

        this.get('svg').start();

      }, 100);

    }

  },

  willDestroyElement() {

    if (this.get('svg')) {

      this.get('svg').destory();

    }
    this._super();

  },
  create() {

    this.set('svg', initGraph({
      el:              this.$()[0],
      min:             this.get('min'),
      minMax:          this.get('minMax'),
      max:             this.get('max'),
      gradient:        this.get('gradient'),
      formatter:       this.get('formatter'),
      maxDoubleInital: this.get('maxDoubleInital'),
      fields:          this.get('fields'),
      query:           this.query.bind(this)
    }));

  },

  query(field) {

    return this.get(`model.${ field }`);

  },

  onResize() {

    if (this.get('svg')) {

      this.get('svg').fit();

    }

  },

});
