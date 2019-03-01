import Component from '@ember/component';
import layout from './template';
import { get, observer, setProperties } from '@ember/object'

export default Component.extend({
  layout,

  advanced:   false,
  classNames: ['mt-20'],

  inheritedChange: observer('model.inherited', function() {
    const { model, level } = this

    if (level === 'rule' || get(model, 'inherited')) {
      const alertGroup = get(this, 'alertGroup') || {}
      const {
        groupWaitSeconds, groupIntervalSeconds, repeatIntervalSeconds
      } = alertGroup

      setProperties(model, {
        groupWaitSeconds,
        groupIntervalSeconds,
        repeatIntervalSeconds,
      })
    }
  }),
});
