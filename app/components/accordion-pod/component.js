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
      sort:           ['displayState', 'sortName', 'id'],
      translationKey: 'generic.state',
      width:          120
    },
    {
      name:           'name',
      sort:           ['sortName', 'id'],
      translationKey: 'generic.name',
      width:          350
    },
    {
      name:           'displayImage',
      sort:           ['displayImage', 'displayIp', 'created'],
      translationKey: 'generic.image',
    },
    {
      name:           'node',
      sort:           ['node.sortName', 'node.ipAddress', 'node.id'],
      translationKey: 'generic.node',

    },
  ],
});
