import Component from '@ember/component';
import layout from './template';
import { get, setProperties, observer } from '@ember/object';

export default Component.extend({
  layout,
  loading:          true,
  error:            false,
  loaded:           false,
  value:            null,

  waitUntilResolved: null,

  init() {
    this._super(...arguments);
    this.addHooksToWaitUntilResolved();
  },

  waitUntilResolvedObserver: observer('waitUntilResolved', function() {
    this.addHooksToWaitUntilResolved();
  }),

  addHooksToWaitUntilResolved: function() {
    setProperties(this, {loading: true, loaded: false, value: null});
    get(this, 'waitUntilResolved')
      .then(
        (value) => setProperties(this, {loading: false, loaded: true, value: value}),
        (value) => setProperties(this, {loading: false, error: true, value: value})
      );
  }
});
