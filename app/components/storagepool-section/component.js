import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  single: false,

  classNames: ['stack-section','storage', 'clear-section'],

  sortBy: 'name',
  headers: [
    {
      name:           'state',
      sort:           ['state','displayName','id'],
      translationKey: 'generic.state',
      width:          115,
    },
    {
      name:           'name',
      sort:           ['displayName','id'],
      translationKey: 'storagePoolSection.models.table.header.volumeName',
      width:          350,
    },
    {
      name:           'mounts',
      translationKey: 'storagePoolSection.models.table.header.mounts',
      sort:           ['mounts.length:desc', 'displayName','id'],
    },
  ],

  hostsByName: function() {
    return (this.get('model.hosts')||[]).sortBy('displayName');
  }.property('model.hosts.@each.displayName'),
});
