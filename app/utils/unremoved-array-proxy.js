import Ember from 'ember';
import FilteredSortedArrayProxy from 'ui/utils/filtered-sorted-array-proxy';

var undesireable = ['removed','purging','purged'];

export default FilteredSortedArrayProxy.extend({
  dependentKeys: ['sourceContent.@each.state'],
  filterFn(item) {
    return undesireable.indexOf((Ember.get(item,'state')||'').toLowerCase()) === -1;
  },
});
