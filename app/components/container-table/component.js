import Ember from 'ember';

export const headersWithHost =  [
  {
    name: 'stateSort',
    searchField: 'displayState',
    sort: ['stateSort','name','id'],
    translationKey: 'containersPage.index.table.header.state',
    width: '120px'
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
  {
    name: 'hostName',
    searchField: 'primaryHost.displayName',
    sort: ['primaryHost.displayName','name','id'],
    translationKey: 'containersPage.index.table.header.host',
  },
  {
    name: 'imageUuid',
    sort: ['imageUuid','id'],
    searchField: 'displayImage',
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
];

export const headersWithoutHost = headersWithHost.filter((x) => x.name !== 'hostName');

export default Ember.Component.extend({
  prefs: Ember.inject.service(),

  stickyHeader: true,
  showHost: true,
  pagingLabel: 'pagination.container',

  sortBy: 'name',

  headers: function() {
    if ( this.get('showHost') ) {
      return headersWithHost;
    } else {
      return headersWithoutHost;
    }
  }.property(),

  filtered: function() {
    let out = this.get('body')||[];

    if ( !this.get('prefs.showSystemContainers') ) {
      out = out.filterBy('isSystem', false);
    }

    return out;
  }.property('body.@each.isSystem','prefs.showSystemContainers'),
});
