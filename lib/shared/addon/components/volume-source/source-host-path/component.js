import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  field: 'hostPath',
  fieldType: 'hostPathVolumeSource',

  kindChoices: [
    'DirectoryOrCreate',
    'FileOrCreate',
    'Directory',
    'File',
    'Socket',
    'CharDevice',
    'BlockDevice',
  ],
});
