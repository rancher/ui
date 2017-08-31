import Ember from 'ember';

export const headersAll =  [
  {
    name: 'state',
    sort: ['stateSort','sortName','id'],
    searchField: 'displayState',
    translationKey: 'generic.state',
    width: 150,
  },
  {
    name: 'name',
    sort: ['sortName','id'],
    translationKey: 'generic.name',
  },
  {
    name: 'image',
    sort: ['image','sortName','id'],
    searchField: 'image',
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
  showInstanceState: true,
  pagingLabel: 'pagination.container',
  paging: true,

  sortBy: 'name',

  extraSearchFields: ['displayIp','primaryHost.displayName'],

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
