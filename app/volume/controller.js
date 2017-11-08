import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import Util from 'ui/utils/util';
import { volumes as VolumeHeaders } from 'shared/headers';

const headers = VolumeHeaders;

export default Controller.extend({
  queryParams: ['type'],
  stack:       alias('model.stack'),
  host:        alias('model.host'),
  volume:      alias('model.volume'),

  sizeGB: computed('volume.sizeMb', function() {
    let sizeOut = Util.formatGB(this.get('volume.sizeMb'));
    return sizeOut;
  }),

  driverOpts: computed('volume.driverOpts', function() {
    if (this.get('volume.driverOpts')) {
      let out  = [];
      let opts = this.get('volume.driverOpts')
      let keys = Object.keys(opts);
      keys.forEach((key) => {
        out.push({key: key, value: opts[key]});
      })
      return out;
    }
    return [];
  }),
  dCount: computed('', function() {
    return this.get('volume.driverOpts.length') || 0;
  }),

  vCount: computed('', function() {
    return this.get('volume.mounts.length') || 0;
  }),

  headers,

  optsHeaders: [
    {
      name:           'key',
      sort:           ['key:desc'],
      translationKey: 'volumesPage.driverOptions.labels.key',
    },
    {
      name:           'value',
      sort:           ['value:desc'],
      translationKey: 'volumesPage.driverOptions.labels.value',
    },
  ],
});
