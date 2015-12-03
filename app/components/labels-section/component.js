import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import Sortable from 'ui/mixins/sortable';

export default Ember.Component.extend(ManageLabels, Sortable, {
  model: null,

  sortableContent: Ember.computed.alias('labelArray'),
  sortBy: 'kind',
  descending: true,
  sorts: {
    kind: ['type','key'],
    key: ['key'],
    value: ['value','key'],
  },

  didInitAttrs() {
    this.initLabels(this.get('model.labels'));
  },
});
