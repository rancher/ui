import Ember from 'ember';

var undesireable = ['removed','purging','purged'];

export default Ember.Mixin.create({
  filterStates: null,
  filterableContent: Ember.computed.alias('model'),

  init() {
    this._super();
    if ( !this.get('filterStates') )
    {
      this.set('filterStates', undesireable.slice());
    }
  },

  filtered: function() {
    var filterStates = this.get('filterStates');
    return this.get('filterableContent').filter((row) => {
      var state = (row.get('state')||'').toLowerCase()
      return filterStates.indexOf(state) === -1;
    });
  }.property('filterableContent.@each.state','filterStates.[]'),
});
