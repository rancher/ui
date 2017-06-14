import Ember from 'ember';
const { get } = Ember;

export default Ember.Mixin.create({
  sortableContent: Ember.computed.alias('model'),
  headers: null,
  preSorts: null,
  sortBy: null,
  descending: false,

  actions: {
    changeSort: function(name) {
      if ( this.get('sortBy') === name )
      {
        this.set('descending', !this.get('descending'));
      }
      else
      {
        this.setProperties({
          descending: false,
          sortBy: name
        });
      }
    },

    // Like changeSort, but without the auto-flipping
    setSort: function(name) {
      this.setProperties({
        descending: false,
        sortBy: name
      });
    },
  },

  currentSort: Ember.computed('sortBy','headers.@each.{sortBy}','descending', function() {
    var headers = this.get('headers');
    var desc = this.get('descending');
    let sort = this.get('preSorts')||[];

    if ( headers )
    {
      var header = headers.findBy('name', this.get('sortBy'));
      if ( header ) {
        let more = get(header,'sort');
        if ( more && more.length) {
          if ( desc ) {
            sort.pushObjects(more.map((x) => {
              let parts = x.split(/:/);
              if ( parts.length === 2 && parts[1] === 'desc' ) {
                return parts[0];
              } else {
                return x+':desc';
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

  arranged: Ember.computed.sort('sortableContent','currentSort'),
});
