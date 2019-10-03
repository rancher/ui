import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from './template';

export const headersAll =  [
  {
    name:           'state',
    sort:           ['sortState', 'sortName', 'id'],
    searchField:    'displayState',
    translationKey: 'generic.state',
    width:          150,
  },
  {
    name:           'name',
    sort:           ['sortName', 'id'],
    translationKey: 'generic.name',
  },
  {
    name:           'image',
    sort:           ['image', 'sortName', 'id'],
    searchField:    'image',
    translationKey: 'generic.image',
  },
];

export const headersWithNode = headersAll.filter((x) => x.name !== 'stats');
export const headersWithoutHost = headersWithNode.filter((x) => x.name !== 'hostName');
export const headersWithStats = headersAll.filter((x) => x.name !== 'hostName');

export default Component.extend({
  prefs: service(),

  layout,
  stickyHeader: true,

  showNode:          true,
  showStats:         false,
  showInstanceState: true,
  pagingLabel:       'pagination.container',
  paging:            true,

  sortBy: 'name',

  extraSearchFields: ['displayIp', 'primaryHost.displayName'],

  headers: computed(function() {
    if ( this.get('showStats') ) {
      return headersWithStats;
    } else if ( this.get('showNode') ) {
      return headersWithNode;
    } else {
      return headersWithoutHost;
    }
  }),

  filtered: computed('body.@each.isSystem', function() {
    let out = this.get('body') || [];

    return out;
  }),
});
