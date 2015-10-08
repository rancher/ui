import Ember from 'ember';

import ManageLabels from 'ui/mixins/manage-labels';

export default Ember.Component.extend(EditLabels, {
  initialLabels: null,

  didInitAttrs() {
    this.initLabels(this.get('initialLabels'));
  },
});
