import Ember from 'ember';
import FilteredSorted from 'ui/utils/filtered-sorted-array-proxy';

export default Ember.Route.extend({
  model: function() {
    let ns = this.modelFor('k8s-tab.namespace');
    return this.get('store').findAll('kubernetesstack').then((stacks) => {
      return FilteredSorted.create({
        sourceContent: stacks,
        filterFn: function(stack) {
          return stack.get('namespace') === ns.get('id');
        }
      });
    });
  },
});
