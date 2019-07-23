import { set } from '@ember/object'
import Component from '@ember/component';
import layout from './template';


export default Component.extend({
  layout,

  editing: true,
  subset:  null,

  actions: {
    removeSubset(subset) {
      if ( this.removeSubset ) {
        this.removeSubset(subset);
      }
    },

    setLabels(labels) {
      set(this, 'subset.labels', labels);
    },
  },
});
