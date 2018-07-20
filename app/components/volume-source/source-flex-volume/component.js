import Component from '@ember/component';
import layout from './template';
import VolumeSource from 'shared/mixins/volume-source';
import { set, get } from '@ember/object';

export default Component.extend(VolumeSource, {
  layout,
  field:     'flexVolume',
  fieldType: 'flexVolumeSource',
  didInsertElement() {
    get(this, 'config.secretRef') || set(this, 'config.secretRef', {});
  }
});
