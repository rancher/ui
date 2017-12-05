import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export const headers = [
  {
    name: 'state',
    sort: ['sortState','displayName'],
    searchField: 'displayState',
    translationKey: 'generic.state',
    width: 120
  },
  {
    name: 'name',
    sort: ['sortName','id'],
    searchField: 'displayName',
    translationKey: 'namespacesPage.table.name.label',
  },
  {
    name: 'project',
    sort: ['project.sortName','id'],
    searchField: 'project.displayName',
    translationKey: 'namespacesPage.table.project.label',
  },
  {
    name: 'pods',
    sort: ['pods.length','id'],
    searchField: null,
    translationKey: 'namespacesPage.table.pods.label',
  },
  {
    name: 'workloads',
    sort: ['workloads.length','id'],
    searchField: null,
    translationKey: 'namespacesPage.table.workloads.label',
  },
  {
    name: 'created',
    sort: ['created','id'],
    searchField: 'created',
    translationKey: 'namespacesPage.table.created.label',
  },
];

export default Controller.extend({
  queryParams: ['sortBy'],
  sortBy: 'name',
  headers: headers,
  rows: alias('model.namespaces'),
});
