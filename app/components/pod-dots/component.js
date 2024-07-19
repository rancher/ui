import { get, computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import pagedArray from 'ember-cli-pagination/computed/paged-array';
import { filter } from 'ui/utils/search-text';
import layout from './template';

export const searchFields = ['displayName', 'id:prefix', 'displayState', 'image', 'displayIp:ip'];

export default Component.extend({
  layout,
  pod:          null,
  pods:         null,
  searchText:   null,
  groupByPod:   false,
  paging:       true,
  sort:         ['sortStr'],
  searchFields,

  tagName: '',

  page:             1,
  perPage:          120,
  pageCountChanged: observer('indexFrom', 'filtered.length', function() {
    // Go to the last page if we end up past the last page
    let from = this.indexFrom;
    let last = this.get('filtered.length');
    var perPage = this.perPage;

    if ( this.page > 1 && from > last) {
      let page = Math.ceil(last / perPage);

      this.set('page', page);
    }
  }),
  // Ignore the setting because these are tiny dots.

  filtered: computed('pod', 'pods.[]', 'searchFields', 'searchText', function() {
    let out = [];
    const pod = this.pod;
    const pods = this.pods;

    if ( pods ) {
      out.pushObjects(pods.slice());
    }

    if ( pod ) {
      out.pushObject(pod);
    }

    const { matches } = filter(out, this.searchText, this.searchFields);

    return matches;
  }),

  pagedContent: pagedArray('filtered', {
    page:    alias('parent.page'),
    perPage: alias('parent.perPage')
  }),

  indexFrom: computed('page', 'perPage', function() {
    var current =  this.page;
    var perPage =  this.perPage;

    return Math.max(0, 1 + perPage * (current - 1));
  }),

  indexTo: computed('indexFrom', 'perPage', 'filtered.length', function() {
    return Math.min(this.get('filtered.length'), this.indexFrom + this.perPage - 1);
  }),

});
