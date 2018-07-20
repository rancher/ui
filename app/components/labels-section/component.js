import { observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ManageLabels from 'shared/mixins/manage-labels';
import layout from './template';

export default Component.extend(ManageLabels, {
  layout,
  model: null,

  sortBy:      'kind',
  showKind:    true,
  descending:  true,

  headers:     [
    {
      name:           'kind',
      sort:           ['type', 'key'],
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
      sort:           ['value', 'key'],
      translationKey: 'labelsSection.value',
    },
  ],

  labelSource:    alias('model.labels'),
  didReceiveAttrs() {
    this.initLabels(this.get('labelSource'));
  },
  labelsObserver: observer('model.labels', function() {
    this.initLabels(this.get('labelSource'));
  }),

});
