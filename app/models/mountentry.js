import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';

export default Resource.extend({
  intl:        service(),
  isReadWrite: equal('permission', 'rw'),
  isReadOnly:  equal('permission', 'ro'),

  instance:    reference('instanceId'),
  volume:      reference('volumeId'),

  displayVolumeName: computed('volumeName', function() {
    let name = this.volumeName;

    if ( name.match(/^[0-9a-f]{64}$/) ) {
      return (`${ name.substr(0, 12) }&hellip;`).htmlSafe();
    }

    return name;
  }),

  displayPermission: computed('permission', function() {
    let permission = this.permission;
    let out        = null;
    let intl       = this.intl;

    switch (permission) {
    case 'ro':
      out = intl.t('formVolumeRow.opts.ro');
      break;
    case 'rw':
      out = intl.t('formVolumeRow.opts.rw');
      break;
    default:
      out = permission;
      break;
    }

    return out;
  }),
});
