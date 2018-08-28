import Component from '@ember/component';
import layout from './template';
import VolumeSource from 'shared/mixins/volume-source';

export default Component.extend(VolumeSource, {
  layout,
  field:     'flocker',
});
