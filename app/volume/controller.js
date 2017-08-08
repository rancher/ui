import Ember from 'ember';

export default Ember.Controller.extend({
  intl: Ember.inject.service(),
  queryParams: ['type'],
  driver: Ember.computed('model.driver', function() {
    return this.get('model.driver') || this.get('intl').findTranslationByKey('generic.na');
  }),
  uri: Ember.computed('model.uri', function() {
    return this.get('model.uri') || this.get('intl').findTranslationByKey('generic.na');
  }),
  driverOpts: Ember.computed('model.driverOpts', function() {
    if (this.get('model.driverOpts')) {
      let out = [];
      let opts = this.get('model.driverOpts')
      let keys = Object.keys(opts);
      keys.forEach((key) => {
        out.push({key: key, value: opts[key]});
      })
      return out;
    }
  }),
  headers: [
    {
      name: 'instanceName',
      sort: ['instanceName:desc', 'instanceId:desc'],
      translationKey: 'volumesPage.mounts.table.instance',
    },
    {
      name: 'path',
      sort: ['path'],
      translationKey: 'volumesPage.mounts.table.path',
    },
    {
      name: 'permission',
      sort: ['permission'],
      translationKey: 'volumesPage.mounts.table.permission',
    },
    {
      name: 'volumeName',
      translationKey: 'volumesPage.mounts.table.volume',
      sort: ['volumeName:desc', 'volumeId:desc'],
    },
  ],
  optsHeaders: [
    {
      name: 'key',
      sort: ['key:desc'],
      translationKey: 'volumesPage.driverOptions.labels.key',
    },
    {
      name: 'value',
      sort: ['value:desc'],
      translationKey: 'volumesPage.driverOptions.labels.value',
    },
  ],
});
