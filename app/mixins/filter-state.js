import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  filterStates: null,
  filterableContent: Ember.computed.alias('model'),

  init() {
    this._super();
    if ( !this.get('filterStates') )
    {
      this.set('filterStates', C.REMOVEDISH_STATES.slice());
    }
  },

  filtered: function() {
    var filterStates = this.get('filterStates');
    return (this.get('filterableContent')||[]).filter((row) => {
      var state = (row.get('state')||'').toLowerCase();
      return filterStates.indexOf(state) === -1;
    });
  }.property('filterableContent.@each.state','filterStates.[]'),
});
