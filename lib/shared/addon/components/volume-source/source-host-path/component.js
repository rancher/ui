import Component from '@ember/component';
import layout from './template';
import { get } from '@ember/object';

const FIELD = 'hostPath';
const TYPE = 'hostPathVolumeSource';

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
