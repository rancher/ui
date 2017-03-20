import Ember from 'ember';
const { get } = Ember;

export default Ember.Mixin.create({
  sortableContent: Ember.computed.alias('model'),
  headers: null,
  sortBy: null,
  descending: false,

  actions: {
    changeSort: function(name) {
      console.log('changeSort', name);
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

  currentSort: Ember.computed('sortBy','headers.@each.{sortBy}', function() {
    var headers = this.get('headers');
    if ( headers )
    {
      var header = headers.findBy('name', this.get('sortBy'));
      if ( header ) {
        let sort = get(header,'sort');
        if ( sort && sort.length) {
          return sort;
        }
      }
    }

    return ['id'];
  }),

  _sorted: Ember.computed.sort('sortableContent','currentSort'),

  arranged: Ember.computed('_sorted.[]','descending', function(){
    let out = this.get('_sorted');
    if ( this.get('descending') )
    {
      return out.slice().reverse();
    }
    else
    {
      return out;
    }
  }),
});
