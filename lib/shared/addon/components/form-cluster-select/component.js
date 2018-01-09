import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';
import { observer } from '@ember/object';

export default Component.extend({
  layout,
  requestedClusterId: null,
  requestedRoles: null,
  defaultExpand: null,
  didReceiveAttrs() {
    this._super(...arguments);

    if (!get(this, 'expandFn')) {
      set(this, 'expandFn', function(item) {
        item.toggleProperty('expanded');
      });
    }
  },

  workerWatch: observer('machine.requestedClusterId', function() {
    let rcid = (get(this, 'machine.requestedClusterId')||'');
    if (rcid.length > 0) {
      // TODO 2.0 set as default worker until others are ready
      set(this, 'requestedRoles', ['worker']);
    } else {
      set(this, 'requestedRoles', null);
    }
  }),
});
