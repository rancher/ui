import Component from '@ember/component';
import ManageLabels from 'shared/mixins/manage-labels';
import layout from './template';

export default Component.extend(ManageLabels, {
  layout,
  model:         null,
  expandOnInit:  true,
  sortBy:        'displayState',
  showKind:      true,
  descending:    true,
  initExpand:       true,
  headers:       [
    {
      name:           'displayState',
      sort:           ['displayState'],
      translationKey: 'generic.state',
      width:          120
    },
    {
      name:           'name',
      sort:           ['name'],
      translationKey: 'generic.name',
      width:          400
    },
    {
      name:           'displayImage',
      sort:           ['displayImage'],
      translationKey: 'generic.image',
    },
    {
      name:           'node',
      sort:           ['displayName'],
      translationKey: 'generic.node',
      width:          180
    },
  ],
});
