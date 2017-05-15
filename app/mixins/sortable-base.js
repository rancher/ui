import Ember from 'ember';
const { get } = Ember;

export default Ember.Mixin.create({
  sortableContent: Ember.computed.alias('model'),
  headers: null,
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
    if ( headers )
    {
      var header = headers.findBy('name', this.get('sortBy'));
      if ( header ) {
        let sort = get(header,'sort');
        if ( sort && sort.length) {
          if ( desc ) {
            return sort.map((x) => {
              let parts = x.split(/:/);
              if ( parts.length === 2 && parts[1] === 'desc' ) {
                return parts[0];
              } else {
                return x+':desc';
              }
            });
          } else {
            return sort;
          }
        }
      }
    }

    if ( desc ) {
      return ['id:desc'];
    } else {
      return ['id'];
    }
  }),

  arranged: Ember.computed.sort('sortableContent','currentSort'),
});
