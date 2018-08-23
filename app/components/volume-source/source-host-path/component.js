import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';
import VolumeSource from 'shared/mixins/volume-source';

export default Component.extend(VolumeSource, {
  layout,
  field:     'hostPath',

  kindChoices: computed(() => {
    const out = [
      {
        label: 'volumeSource.host-path.kind.Any',
        value: ''
      },
    ];

    ['DirectoryOrCreate',
      'FileOrCreate',
      'Directory',
      'File',
      'Socket',
      'CharDevice',
      'BlockDevice'].forEach((value) => {
      out.push({
        label: `volumeSource.host-path.kind.${ value }`,
        value
      });
    });

    return out;
  }),
});
