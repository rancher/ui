import Component from '@ember/component';
import layout from './template';
import VolumeSource from 'shared/mixins/volume-source';
import { get } from '@ember/object';

const FIELD = 'hostPath';
const TYPE = 'hostPathVolumeSource';

export default Component.extend(VolumeSource, {
  layout,
  field: FIELD,

  configForNew() {
    const out = get(this, 'store').createRecord({
      type: TYPE,
      kind: "",
    });

    out.set('type', ''); // @TODO-2.0 type is used for the API field, boo
    return out;
  },

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
