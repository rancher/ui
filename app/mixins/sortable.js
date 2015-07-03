import Ember from 'ember';

export default Ember.Mixin.create({
  sortableContent: Ember.computed.alias('model'),
  sorts: null, // { id: ['id'], date: ['created','id'] }
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
    }
  },

  currentSort: function() {
    var sorts = this.get('sorts');
    if ( sorts )
    {
      var sort = sorts[this.get('sortBy')];
      if ( sort )
      {
        return sort;
      }
    }
  }.property('sortBy','sorts.@each.{name}'),

  arranged: function(){
    var content = this.get('sortableContent');
    var currentSort = this.get('currentSort');
    var out;
    if ( currentSort )
    {
      out = content.sortBy.apply(content, currentSort);
    }
    else
    {
      out = content.slice();
    }

    if ( this.get('descending') )
    {
      return out.reverse();
    }
    else
    {
      return out;
    }
  }.property('sortableContent.[]','currentSort','descending'),
});
