import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';
import { observer } from '@ember/object';

export default Component.extend({
  layout,
  requestedClusterId: null,
  didReceiveAttrs() {
    this._super(...arguments);

    if (!get(this, 'expandFn')) {
      set(this, 'expandFn', function(item) {
        item.toggleProperty('expanded');
      });
    }

    if (!get(this, 'machine.requestedClusterId')) {
      set(this, 'requestedClusterId', '');
    }
  },

  workerWatch: observer('machine.requestedClusterId', function() {
    let rcid = (get(this, 'machine.requestedClusterId')||'');
    if (rcid.length > 0) {
      // TODO 2.0 set as default worker until others are ready
      set(get(this, 'machine'), 'requestedRoles', ['worker']);
    } else {
      set(get(this, 'machine'), 'requestedRoles', null);
    }
  }),
});
