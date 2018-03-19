import Component from '@ember/component';
import layout from './template';
import { get, setProperties, computed, observer } from '@ember/object';
import VolumeSource from 'shared/mixins/volume-source';

export default Component.extend(VolumeSource, {
  layout,

  inputDidUpdate: observer('config.{monitors.[],path,readOnly,secretFile,secretRef.name,secretRef.namespace,user}', function () {
    this.sendUpdate();
  }),
});
