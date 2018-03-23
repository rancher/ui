import Component from '@ember/component';
import layout from './template';
import { observer } from '@ember/object';
import VolumeSource from 'shared/mixins/volume-source';

export default Component.extend(VolumeSource, {
  layout,

  inputDidUpdate: observer('config.{chapAuthDiscovery,chapAuthSession,fsType,initiatorName,iqn,iscsiInterface,lun,portals.[],readOnly,secretRef.name,targetPortal}', function () {
    this.sendUpdate();
  }),
});
