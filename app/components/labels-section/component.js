import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import Sortable from 'ui/mixins/sortable';

export default Ember.Component.extend(ManageLabels, Sortable, {
  model           : null,

  labelSource     : Ember.computed.alias('model.labels'),
  sortableContent : Ember.computed.alias('labelArray'),
  sortBy          : 'kind',
  showKind        : true,
  descending      : true,

  sorts: {
    kind  : ['type','key'],
    key   : ['key'],
    value : ['value','key'],
  },

  labelsObserver: Ember.observer('model.labels', function () {
    this.initLabels(this.get('labelSource'));
  }),

  didReceiveAttrs() {
    this.initLabels(this.get('labelSource'));
  },
});
