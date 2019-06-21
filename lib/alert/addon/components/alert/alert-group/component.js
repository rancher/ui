import Component from '@ember/component';
import layout from './template';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service'
import { reads } from '@ember/object/computed'

export default Component.extend({
  scope:        service(),

  layout,
  model:          null,
  fullColspan:    null,
  alignState:     'text-center',
  noGroup:        'namespaceGroup.none',
  groups:         [],
  tagName:        '',
  noAlerts:       false,
  hasOtherGroups: true,

  pageScope:   reads('scope.currentPageScope'),

  group: computed('model.group', function() {
    const groupId = get(this, 'model.group')
    const groups = get(this, 'groups')
    const filter = groups.filter((g) => g.id === groupId)

    return get(filter, 'firstObject')
  }),
});
