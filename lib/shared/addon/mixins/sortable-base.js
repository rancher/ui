import { alias, sort } from '@ember/object/computed';
import Mixin from '@ember/object/mixin';
import { get, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default Mixin.create({
  sortableContent: alias('model'),
  headers:         null,
  preSorts:        null,
  sortBy:          null,
  groupByRef:      null,
  descending:      false,

  actions: {
    changeSort(name) {
      if ( this.get('sortBy') === name ) {
        this.set('descending', !this.get('descending'));
      } else {
        this.setProperties({
          descending: false,
          sortBy:     name
        });
      }
    },

    // Like changeSort, but without the auto-flipping
    setSort(name) {
      this.setProperties({
        descending: false,
        sortBy:     name
      });
    },
  },

  currentSort: computed('sortBy', 'groupByRef', 'headers.@each.{sortBy}', 'descending', function() {
    var headers = this.get('headers');
    var desc = this.get('descending');
    let sort = (this.get('preSorts') || []).slice();

    if (!isEmpty(sort) && desc) {
      sort = sort.map((s) => `${ s }:desc` );
    }

    if ( get(this, 'groupByRef') ) {
      const groupSortBy = `${ get(this, 'groupByRef') }.displayName`;

      if ( desc ) {
        sort.push(`${ groupSortBy }:desc`);
      } else {
        sort.push(groupSortBy);
      }
    }

    if ( headers ) {
      var header = headers.findBy('name', this.get('sortBy'));

      if ( header ) {
        let more = get(header, 'sort');

        if ( more && more.length) {
          if ( desc ) {
            sort.pushObjects(more.map((x) => {
              let parts = x.split(/:/);

              if ( parts.length === 2 && parts[1] === 'desc' ) {
                return parts[0];
              } else {
                return `${ x }:desc`;
              }
            }));
          } else {
            sort.pushObjects(more);
          }

          return sort;
        }
      }
    }

    if ( desc ) {
      sort.push('id:desc');
    } else {
      sort.push('id');
    }

    return sort;
  }),

  arranged: sort('sortableContent', 'currentSort'),
});
