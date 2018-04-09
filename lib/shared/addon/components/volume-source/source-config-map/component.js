import Component from '@ember/component';
import layout from './template';
import { observer } from '@ember/object';
import VolumeSource from 'shared/mixins/volume-source';

export default Component.extend(VolumeSource, {
  layout,

  field: 'configMap',
  fieldType: 'configMapVolumeSource',
  inputDidUpdate: observer('config.{defaultMode,items,name,optional}', function () {
    this.sendUpdate();
  }),
});
