import Controller from '@ember/controller';
import FilterState from 'ui/mixins/filter-state';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { get } from '@ember/object';

const headers = [
  {
    translationKey: 'membersPage.index.table.userId',
    name:           'user.displayName',
    sort:           ['user.displayName', 'name', 'id'],
  },
  {
    translationKey: 'membersPage.index.table.template',
    name:           'roleTemplateId',
    sort:           ['roleTemplateId'],
  },
  {
    translationKey: 'generic.created',
    name:           'created',
    sort:           ['created'],
    searchField:    false,
    classNames:     'text-right pr-20',
    width:          200,
  },
]

export default Controller.extend(FilterState, {
  scope:             service(),
  sortBy:            'name',
  headers,
  searchText:        '',
  filterableContent: computed('model.projectRoleTemplateBindings.[]', function() {
    return get(this, 'model.projectRoleTemplateBindings').filter((b) => !get(b, 'serviceAccount'));
  }),
});
