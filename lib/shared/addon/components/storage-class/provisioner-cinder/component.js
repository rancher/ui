import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';
import { get, setProperties, observer } from '@ember/object';

export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner: 'cinder',

  type: null,
  availability: null,

  didReceiveAttrs() {
    const changes = {};

    changes['type'] = get(this, 'parameters.type') || '';

    const zone = get(this, 'parameters.availability');
    if (zone) {
      changes['zoneAutomatic'] = false;
      changes['availability'] = zone;
    } else {
      changes['zoneAutomatic'] = true;
      changes['availability'] = '';
    }

    setProperties(this, changes);
  },

  sendUpdate: observer('type', 'availability', 'zoneAutomatic', function () {
    const type = get(this, 'type');
    const out = {};

    if (type) {
      out['type'] = type;
    }

    const zoneAutomatic = get(this, 'zoneAutomatic');
    if (!zoneAutomatic) {
      const zones = (get(this, 'availability') || '').trim();
      if (zones) {
        out['availability'] = zones;
      }
    }

    this.sendAction('changed', out);
  }),
});
