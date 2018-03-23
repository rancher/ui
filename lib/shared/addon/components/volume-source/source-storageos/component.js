import Component from '@ember/component';
import layout from './template';
import { observer } from '@ember/object';
import VolumeSource from 'shared/mixins/volume-source';

export default Component.extend(VolumeSource, {
  layout,

  inputDidUpdate: observer('config.{fsType,readOnly,secretRef.name,secretRef.namespace,volumeName,volumeNamespace}', function () {
    this.sendUpdate();
  }),
});
