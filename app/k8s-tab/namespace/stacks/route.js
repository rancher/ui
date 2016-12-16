import Ember from 'ember';
import FilteredSorted from 'ui/utils/filtered-sorted-array-proxy';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model: function() {
    let ns = this.modelFor('k8s-tab.namespace');
    return this.get('store').findAll('kubernetesstack').then((stacks) => {
      return FilteredSorted.create({
        sourceContent: stacks,
        dependentKeys: ['sourceContent.@each.namespace','sourceContent.@each.state'],
        filterFn: function(stack) {
          return stack.get('namespace') === ns.get('id') && !C.REMOVEDISH_STATES.includes(stack.get('state'));
        }
      });
    });
  },
});
