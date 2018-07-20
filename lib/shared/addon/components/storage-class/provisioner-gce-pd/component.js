import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';
import { get, set, setProperties } from '@ember/object';

export const VOLUME_TYPES = [
  'pd-standard',
  'pd-ssd',
];

export default Component.extend(StorageClassProvisioner, {
  layout,
  volumeTypes: VOLUME_TYPES,

  volumeType:    null,
  zones:         null,
  zoneAutomatic: null,

  didReceiveAttrs() {
    const changes = {};

    changes['volumeType'] = get(this, 'parameters.type') || 'pd-standard';

    const zone = get(this, 'parameters.zone');
    const zones = get(this, 'parameters.zones');

    if ( zones && zones.length ) {
      changes['zoneAutomatic'] = false;
      changes['zones'] = zones;
    } else if ( zone ) {
      changes['zoneAutomatic'] = false;
      changes['zones'] = zone;
    } else {
      changes['zoneAutomatic'] = true;
      changes['zones'] = '';
    }

    setProperties(this, changes);
  },

  updateParams() {
    const type = get(this, 'volumeType');
    const out = { type, };

    const zoneAutomatic = get(this, 'zoneAutomatic');

    if ( !zoneAutomatic ) {
      const zones = (get(this, 'zones') || '').trim();

      if ( zones ) {
        out['zones'] = zones;
      }
    }

    set(this, 'parameters', out);
  }
});
