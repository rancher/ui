import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export const headersAll =  [
  {
    name: 'state',
    sort: ['sortState','sortName','id'],
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

export default Component.extend({
  layout,
  prefs: service(),

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

    return out;
  }.property('body.@each.isSystem'),
});
