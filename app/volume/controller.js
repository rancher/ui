import Ember from 'ember';
import Util from 'ui/utils/util';

export const headers = [
  {
    name:           'serviceName',
    sort:           ['instance.service.displayName:desc', 'instanceId:desc'],
    translationKey: 'volumesPage.mounts.table.instance',
  },
  {
    name:           'instanceName',
    sort:           ['instanceName:desc', 'instanceId:desc'],
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
];

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
