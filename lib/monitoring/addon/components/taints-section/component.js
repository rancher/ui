import Component from '@ember/component';
import ManageLabels from 'shared/mixins/manage-labels';
import layout from './template';

export default Component.extend(ManageLabels, {
  layout,

  sortBy:           'key',
  descending:       false,

  headers: [
    {
      name:           'key',
      sort:           ['key'],
      translationKey: 'taintsSection.key',
      width:          200,
    },
    {
      name:           'value',
      sort:           ['value'],
      translationKey: 'taintsSection.value',
      width:          200,
    },
    {
      name:           'effect',
      sort:           ['effect'],
      translationKey: 'taintsSection.effect',
      width:          200,
    },
  ],
});
