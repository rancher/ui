import Component from '@ember/component';
import layout from './template';
import { get, setProperties } from '@ember/object'

export default Component.extend({
  layout,

  advanced:   false,
  classNames: ['mt-20'],

  init() {
    this._super(...arguments)
    const { model = {} } = this

    if (get(model, 'inherited')) {
      setProperties(model, {
        groupIntervalSeconds:  180,
        groupWaitSeconds:      30,
        repeatIntervalSeconds: 3600,
      })
    }
  },
});
