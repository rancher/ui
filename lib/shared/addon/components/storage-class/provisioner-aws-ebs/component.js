import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';
import { get, set, setProperties, computed } from '@ember/object';

export const VOLUME_TYPES = [
  'gp2',
  'io1',
  'st1',
  'sc1',
];

export default Component.extend(StorageClassProvisioner, {
  layout,
  volumeTypes: VOLUME_TYPES,

  volumeType:    null,
  zones:         null,
  zoneAutomatic: null,
  iopsPerGB:     null,
  encrypted:     true,
  kmsKeyId:      null,
  kmsAutomatic:  null,
  fsType:        null,

  didReceiveAttrs() {
    const changes = {};

    changes['volumeType'] = get(this, 'parameters.type') || 'gp2';
    changes['iopsPerGB']  = get(this, 'parameters.iopsPerGB') || '';

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

    const fsType = get(this, 'parameters.fsType');

    if ( fsType ) {
      changes['fsType'] = fsType;
    }

    changes['encrypted'] = get(this, 'parameters.encrypted') === 'true';

    const key = get(this, 'parameters.kmsKeyId');

    if ( key ) {
      changes['kmsKeyId'] = key;
      changes['kmsAutomatic'] = false;
    } else {
      changes['kmsAutomatic'] = true;
    }

    setProperties(this, changes);
  },

  supportsIops: computed('volumeType', function() {
    return !!get(this, 'volumeType').match(/^io\d+$/);
  }),
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

    if ( get(this, 'supportsIops') ) {
      out['iopsPerGB'] = `${ get(this, 'iopsPerGB') || '' }`;
    }

    const encrypted = get(this, 'encrypted');
    const kmsKeyId = get(this, 'kmsKeyId');
    const kmsAutomatic = get(this, 'kmsAutomatic');

    if ( encrypted ) {
      out['encrypted'] = 'true';
      if ( !kmsAutomatic && kmsKeyId ) {
        out['kmsKeyId'] = kmsKeyId;
      }
    } else {
      out['encrypted'] = 'false';
    }

    if ( this.fsType ) {
      out['fsType'] = this.fsType;
    }

    set(this, 'parameters', out);
  },

});
