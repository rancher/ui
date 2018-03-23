import Component from '@ember/component';
import layout from './template';
import { observer } from '@ember/object';
import VolumeSource from 'shared/mixins/volume-source';

export default Component.extend(VolumeSource, {
  layout,

  inputDidUpdate: observer('config.{fsType,image,keyring,monitors.[],pool,readOnly,secretRef.name,user}', function () {
    this.sendUpdate();
  }),
});
