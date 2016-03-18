import Ember from 'ember';
import FilteredSortedArrayProxy from 'ui/utils/filtered-sorted-array-proxy';
import C from 'ui/utils/constants';

export default FilteredSortedArrayProxy.extend({
  dependentKeys: ['sourceContent.@each.state'],
  filterFn(item) {
    return C.REMOVEDISH_STATES.indexOf((Ember.get(item,'state')||'').toLowerCase()) === -1;
  },
});
