import Ember from 'ember';
import Util from 'ui/utils/util';
import { volumes as VolumeHeaders } from 'shared/headers';

const headers = VolumeHeaders;

export default Ember.Controller.extend({
  queryParams: ['type'],
  stack:       Ember.computed.alias('model.stack'),
  host:        Ember.computed.alias('model.host'),
  volume:      Ember.computed.alias('model.volume'),

  sizeGB: Ember.computed('volume.sizeMb', function() {
    let sizeOut = Util.formatGB(this.get('volume.sizeMb'));
    return sizeOut;
  }),

  driverOpts: Ember.computed('volume.driverOpts', function() {
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
  dCount: Ember.computed('', function() {
    return this.get('volume.driverOpts.length') || 0;
  }),

  vCount: Ember.computed('', function() {
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
