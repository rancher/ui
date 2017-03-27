import Ember from 'ember';

export const headersAll =  [
  {
    name: 'state',
    sort: ['stateSort','name','id'],
    searchField: 'displayState',
    translationKey: 'generic.state',
    width: 120,
  },
  {
    name: 'name',
    sort: ['name','id'],
    translationKey: 'generic.name',
  },
  {
    name: 'ip',
    sort: ['displayIp','name','id'],
    searchField: 'displayIp',
    translationKey: 'generic.ipAddress',
    width: 110,
  },
  {
    name: 'hostName',
    sort: ['primaryHost.displayName','name','id'],
    searchField: 'primaryHost.displayName',
    translationKey: 'generic.host',
  },
  {
    name: 'image',
    sort: ['imageUuid','id'],
    searchField: 'displayImage',
    translationKey: 'generic.image',
  },
];

export const headersWithHost = headersAll.filter((x) => x.name !== 'stats');
export const headersWithoutHost = headersWithHost.filter((x) => x.name !== 'hostName');
export const headersWithStats = headersAll.filter((x) => x.name !== 'hostName');

export default Ember.Component.extend({
  prefs: Ember.inject.service(),

  stickyHeader: true,

  showHost: true,
  showStats: false,
  pagingLabel: 'pagination.container',

  sortBy: 'name',

  headers: function() {
    if ( this.get('showStats') ) {
      return headersWithStats;
    } else if ( this.get('showHost') ) {
      return headersWithHost;
    } else {
      return headersWithoutHost;
    }
  }.property(),

  filtered: function() {
    let out = this.get('body')||[];

    if ( !this.get('prefs.showSystemResources') ) {
      out = out.filterBy('isSystem', false);
    }

    return out;
  }.property('body.@each.isSystem','prefs.showSystemResources'),
});
