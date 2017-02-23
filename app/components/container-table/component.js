import Ember from 'ember';

export default Ember.Component.extend({
  prefs: Ember.inject.service(),

  stickyHeader: true,
  showHost: true,

  sortBy: 'name',

  headers: function() {
    let out = [
      {
        name: 'stateSort',
        searchField: 'displayState',
        sort: ['stateSort','name','id'],
        translationKey: 'containersPage.index.table.header.state',
        width: '125px'
      },
      {
        name: 'name',
        sort: ['name','id'],
        translationKey: 'containersPage.index.table.header.name',
      },
      {
        name: 'displayIp',
        sort: ['displayIp','name','id'],
        width: '110px',
        translationKey: 'containersPage.index.table.header.ip',
      },
    ];

    if ( this.get('showHost') ) {
      out.push({
        name: 'primaryHost.displayName',
        sort: ['primaryHost.displayName','name','id'],
        translationKey: 'containersPage.index.table.header.host',
      });
    }

    out.pushObjects([
      {
        name: 'imageUuid',
        sort: ['imageUuid','id'],
        translationKey: 'containersPage.index.table.header.image',
      },
      {
        name: 'command',
        sort: ['command','name','id'],
        translationKey: 'containersPage.index.table.header.command',
      },
      {
        isActions: true,
        width: '40px',
      },
    ]);

    return out;
  }.property(),
});
