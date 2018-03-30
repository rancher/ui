import { observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ManageLabels from 'shared/mixins/manage-labels';
import layout from './template';

export default Component.extend(ManageLabels, {
  layout,
  model           : null,
  initExpandAll   : true,
  sortBy          : 'displayState',
  showKind        : true,
  descending      : true,
  initExpand:       true,
  headers:     [
    {
      name:           'displayState',
      sort:           ['displayState'],
      translationKey: 'generic.state',
    },
    {
      name:           'name',
      sort:           ['key'],
      translationKey: 'generic.name',
    },
    {
      name:           'image',
      sort:           ['value','key'],
      translationKey: 'generic.image',
    },
    {
      name:           'displayIp',
      sort:           ['displayIp'],
      translationKey: 'generic.ipAddress',
    },
  ],
  expandAllObserve: function (argument) {
    let expandAll = this.get('expandAll');
    this.set('initExpandAll',expandAll);
  }.observes('expandAll')
});
