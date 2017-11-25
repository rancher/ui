import EmberObject from '@ember/object';
import { get, computed, observer } from '@ember/object';
import { sort, alias } from '@ember/object/computed';
import Component from '@ember/component';
import pagedArray from 'ember-cli-pagination/computed/paged-array';
import { matches } from 'shared/components/sortable-table/component';
import layout from './template';

export const searchFields = ['displayName','id:prefix','displayState','image','displayIp:ip'];

export default Component.extend({
  layout,
  pods: null,
  searchText: null,
  groupByPod: false,
  paging: true,
  sort: ['sortStr'],
  searchFields: searchFields,

  tagName: '',

  page: 1,
  perPage: 120, // Ignore the setting because these are tiny dots.
  // 120 because it has lots of prime factors so that almost any sidekick combination
  // can be shown without a deploymentUnit being broken up into 2 pages.

  // -----
  // Flow: pods -> containers -> arranged -> filtered -> pagedContent -> grouped
  // -----
  containers: computed('pods.@each.containers', function() {
    const out = [];
    get(this, 'pods').forEach((pod) => {
      const containers = get(pod, 'containers');
      Object.keys(containers).forEach((name) => {
        out.push(EmberObject.create({
          pod: pod,
          name: name,
          podId: get(pod, 'id'),
          container: containers[name],
          sortStr: get(pod,'name') + '_' + name,
        }));
      });
    });

    return out;
  }),

  arranged: sort('containers','sort'),
  filtered: computed('arranged.[]','searchText', function() {
    let out = this.get('arranged').slice();
    let searchFields = this.get('searchFields');
    let searchText = (this.get('searchText')||'').trim().toLowerCase();

    if ( searchText.length ) {
      let searchTokens = searchText.split(/\s*[, ]\s*/);

      for ( let i = out.length-1 ; i >= 0 ; i-- ) {
        let row = out[i].container;
        for ( let j = 0 ; j < searchTokens.length ; j++ ) {
          let expect = true;
          let token = searchTokens[j];

          if ( token.substr(0,1) === '!' ) {
            expect = false;
            token = token.substr(1);
          }

          if ( token && matches(searchFields, token, row) !== expect ) {
            out.removeAt(i);
            break;
          }
        }
      }
    }

    return out;
  }),

  pagedContent: pagedArray('filtered', {
    page: alias("parent.page"),
    perPage: alias("parent.perPage")
  }),

  grouped: computed('pagedContent.[].podId', function() {
    let map = {};
    this.get('pagedContent').forEach((row) => {
      let id = row.get('podId');
      let ary = map[id];
      if ( !ary ) {
        ary = [];
        map[id] = ary;
      }

      ary.push(row);
    });

    return Object.values(map);
  }),

  indexFrom: computed('page','perPage', function() {
    var current =  this.get('page');
    var perPage =  this.get('perPage');
    return Math.max(0, 1 + perPage*(current-1));
  }),

  indexTo: computed('indexFrom','perPage','filtered.length', function() {
    return Math.min(this.get('filtered.length'), this.get('indexFrom') + this.get('perPage') - 1);
  }),

  pageCountChanged: observer('indexFrom', 'filtered.length', function() {
    // Go to the last page if we end up past the last page
    let from = this.get('indexFrom');
    let last = this.get('filtered.length');
    var perPage = this.get('perPage');

    if ( this.get('page') > 1 && from > last) {
      let page = Math.ceil(last/perPage);
      this.set('page', page);
    }
  }),
});
