import Ember from 'ember';
import Util from 'ui/utils/util';

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
  }),

  headers: [
    {
      name:           'instanceName',
      sort:           ['instanceName: desc', 'instanceId: desc'],
      translationKey: 'volumesPage.mounts.table.instance',
    },
    {
      name:           'path',
      sort:           ['path'],
      translationKey: 'volumesPage.mounts.table.path',
    },
    {
      name:           'permission',
      sort:           ['permission'],
      translationKey: 'volumesPage.mounts.table.permission',
    },
    {
      name:           'volumeName',
      translationKey: 'volumesPage.mounts.table.volume',
      sort:           ['volumeName: desc', 'volumeId: desc'],
    },
  ],
  optsHeaders: [
    {
      name:           'key',
      sort:           ['key: desc'],
      translationKey: 'volumesPage.driverOptions.labels.key',
    },
    {
      name:           'value',
      sort:           ['value: desc'],
      translationKey: 'volumesPage.driverOptions.labels.value',
    },
  ],
});
