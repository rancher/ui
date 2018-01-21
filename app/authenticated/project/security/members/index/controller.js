import Controller from '@ember/controller';
import FilterState from 'ui/mixins/filter-state';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { get } from '@ember/object';

const headers = [
  {
    translationKey: 'membersPage.index.table.subjectName',
    name: 'user.displayName',
    sort: ['user.dispalyName', 'name', 'id'],
  },
  {
    translationKey: 'membersPage.index.table.template',
    name: 'roleTemplateId',
    sort: ['roleTemplateId'],
  },
  {
    translationKey: 'generic.created',
    name: 'created',
    sort: ['created'],
    classNames: 'text-right pr-20',
    width: 200,
  },
]

export default Controller.extend(FilterState, {
  sortBy: 'name',
  headers: headers,
  scope: service(),
  searchText: '',
  filterableContent: computed('model.projectRoleTemplateBindings.[]', function() {
    return get(this, 'model.projectRoleTemplateBindings');
  }),
});
