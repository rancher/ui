import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import { denormalizeId } from 'ember-api-store/utils/denormalize';

export default Resource.extend({
  intl:        Ember.inject.service(),
  isReadWrite: Ember.computed.equal('permission','rw'),
  isReadOnly:  Ember.computed.equal('permission','ro'),

  instance:    denormalizeId('instanceId'),
  volume:      denormalizeId('volumeId'),

  displayVolumeName: Ember.computed('volumeName', function() {
    let name = this.get('volumeName');
    if ( name.match(/^[0-9a-f]{64}$/) ) {
      return (name.substr(0,12)+'&hellip;').htmlSafe();
    }

    return name;
  }),

  displayPermission: Ember.computed('permission', function() {
    let permission = this.get('permission');
    let out        = null;
    let intl       = this.get('intl');

    switch (permission) {
    case 'ro':
      out = intl.findTranslationByKey('formVolumeRow.opts.ro');
      break;
    case 'rw':
      out = intl.findTranslationByKey('formVolumeRow.opts.rw');
      break;
    default:
      out = permission;
      break;
    }
    return out;
  }),
});
