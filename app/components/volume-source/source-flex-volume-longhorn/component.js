import { get, set } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
import VolumeSource from 'shared/mixins/volume-source';

export default Component.extend(VolumeSource, {
  layout,
  field:     'flexVolume',
  fieldType: 'flexVolumeSource',
  init() {
    this._super();
    get(this, 'config.driver') || set(this, 'config.driver', 'rancher.io/longhorn');
    get(this, 'config.options') || set(this, 'config.options', {
      size:                '2Gi',
      numberOfReplicas:    '3',
      staleReplicaTimeout: '20',
      fromBackup:          ''
    });
    get(this, 'config.secretRef') || set(this, 'config.secretRef', {});
  }
});
