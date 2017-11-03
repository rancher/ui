import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';

export default Ember.Component.extend(ManageLabels, {
  model           : null,

  labelSource     : Ember.computed.alias('model.labels'),
  sortBy          : 'kind',
  showKind        : true,
  descending      : true,

  headers:     [
    {
      name:           'kind',
      sort:           ['type','key'],
      translationKey: 'labelsSection.kind',
      width:          '90',
    },
    {
      name:           'key',
      sort:           ['key'],
      translationKey: 'labelsSection.key',
      width:          '350',
    },
    {
      name:           'value',
      sort:           ['value','key'],
      translationKey: 'labelsSection.value',
    },
  ],

  labelsObserver: Ember.observer('model.labels', function () {
    this.initLabels(this.get('labelSource'));
  }),

  didReceiveAttrs() {
    this.initLabels(this.get('labelSource'));
  },
});
