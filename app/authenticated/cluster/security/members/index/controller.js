import Controller from '@ember/controller';
import FilterState from 'ui/mixins/filter-state';

const headers = [
  {
    translationKey: 'membersPage.index.table.name',
    name: 'name',
    sort: ['name', 'subjectName', 'id'],
  },
  {
    translationKey: 'membersPage.index.table.subjectName',
    name: 'subjectName',
    sort: ['subjectName', 'name', 'id'],
  },
  {
    translationKey: 'membersPage.index.table.subjectKind',
    name: 'subjectKind',
    sort: ['subjectKind', 'subjectName', 'name'],
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
  searchText: '',
});
