import Component from '@ember/component';
import ManageLabels from 'shared/mixins/manage-labels';
import layout from './template';

export default Component.extend(ManageLabels, {
  layout,
  model:         null,
  initExpandAll: true,
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
    },
    {
      name:           'displayImage',
      sort:           ['displayImage'],
      translationKey: 'generic.image',
    },
    {
      name:           'displayIp',
      sort:           ['displayIp'],
      translationKey: 'generic.ipAddress',
      width:          180
    },
  ],

  expandAllObserve: function() {

    let expandAll = this.get('expandAll');

    this.set('initExpandAll', expandAll);

  }.observes('expandAll')
});
