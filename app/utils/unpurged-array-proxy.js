import FilteredSortedArrayProxy from 'ui/utils/filtered-sorted-array-proxy';

export default FilteredSortedArrayProxy.extend({
  dependentKeys: ['sourceContent.@each.state'],
  filterFn(item) {
      return (Ember.get(item,'state')||'').toLowerCase() !== 'purged';
  },
});
