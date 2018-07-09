import { alias } from '@ember/object/computed';
import Mixin from '@ember/object/mixin';
import C from 'ui/utils/constants';

export default Mixin.create({
  filterStates:      null,
  filterableContent: alias('model'),

  init() {

    this._super();
    if ( !this.get('filterStates') ) {

      this.set('filterStates', C.REMOVEDISH_STATES.slice());

    }

  },

  filtered: function() {

    var filterStates = this.get('filterStates');

    return (this.get('filterableContent') || []).filter((row) => {

      var state = (row.get('state') || '').toLowerCase();

      return filterStates.indexOf(state) === -1;

    });

  }.property('filterableContent.@each.state', 'filterStates.[]'),
});
