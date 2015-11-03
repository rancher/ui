/**
 * Sortable - provides sorting functionality to a data set
 * @mixin mixins/sortable
 * @property {object}  sortableContent - content to sort. i.e. model data
 * @property {object}  sorts - fields to sort via object of arrays. Arrays can contain weighted properties to sort on
 *                             i.e  {id: ['id', 'name', 'time']}
 * @property {string}  sortBy - default sort field
 * @property {boolean} descending - default sort order
 * @property {object}  actions - contains the action handeler for changing sorts
 *
 * @function currentSort - returns the current sort
 * @function arranged - returns the sorted data, you should use this as your data to display
 */
import Ember from 'ember';

export default Ember.Mixin.create({
  sortableContent: Ember.computed.alias('model'),
  sorts: null,
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
    var content = this.get('sortableContent')||[];
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
