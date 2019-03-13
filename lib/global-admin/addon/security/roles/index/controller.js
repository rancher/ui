import Controller from '@ember/controller';
import { computed, get, set } from '@ember/object';
import { next } from '@ember/runloop';
import C from 'ui/utils/constants';

const HEADERS = [
  {
    name:           'state',
    sort:           ['state', 'name'],
    translationKey: 'generic.state',
    type:           'string',
    width:          125,
  },
  {
    name:           'name',
    sort:           ['name'],
    translationKey: 'rolesPage.index.table.name',
  },
  {
    name:           'builtin',
    sort:           ['builtin'],
    translationKey: 'rolesPage.index.table.builtin',
    width:          120,
  },
  {
    name:           'Default',
    sort:           ['newUserDefault', 'clusterCreatorDefault', 'projectCreatorDefault'],
    translationKey: 'rolesPage.index.table.global',
    width:          120,
  },
  {
    classNames:     'text-right pr-20',
    name:           'created',
    sort:           ['created'],
    searchField:    false,
    translationKey: 'generic.created',
    width:          250,
  },
];

export default Controller.extend({
  queryParams:      ['context'],

  sortBy:           'name',
  context:          'global',
  searchText:       '',
  headers:          null,
  showOnlyDefaults: false,

  readableMode: computed('context', function() {
    return get(this, 'context').capitalize();
  }),

  globalRows: computed('model.globalRoles.@each.{name,state}', function() {
    return get(this, 'model.globalRoles');
  }),

  projectRows: computed('model.roleTemplates.@each.{name,state}', function() {
    // context should not be blank but if it is include it here as well, we removed it from the UI but you could still create a role without context via api
    return get(this, 'model.roleTemplates').filter( (role ) => !get(role, 'hidden') && (get(role, 'context') !== 'cluster' || !role.hasOwnProperty('context')));
  }),

  clusterRows: computed('model.roleTemplates.@each.{name,state}', function() {
    // context should not be blank but if it is include it here as well, we removed it from the UI but you could still create a role without context via api
    return get(this, 'model.roleTemplates').filter( (role ) => !get(role, 'hidden') && (get(role, 'context') !== 'project') || !role.hasOwnProperty('context'));
  }),

  filteredContent: computed('context', 'model.roleTemplates.@each.{name,state,transitioning}', 'showOnlyDefaults', function() {
    let content                       = null;
    const { context, showOnlyDefaults } = this;
    let headers                       = [...HEADERS];
    const dynamicHeader               = headers.findBy('name', 'Default');
    let nueTranslationKey             = '';

    switch (context) {
    case 'cluster':
      content = get(this, 'clusterRows');

      if (showOnlyDefaults) {
        content = content.filterBy('clusterCreatorDefault');
      }

      nueTranslationKey = 'rolesPage.index.table.cluster';

      break;
    case 'project':
      content = get(this, 'projectRows');

      if (showOnlyDefaults) {
        content = content.filterBy('projectCreatorDefault');
      }

      nueTranslationKey = 'rolesPage.index.table.project';

      break;
    case 'global':
      content = get(this, 'globalRows');
      headers = headers.filter((header) => header.name !== 'builtin');

      if (showOnlyDefaults) {
        content = content.filterBy('newUserDefault');
      }

      nueTranslationKey = 'rolesPage.index.table.global';

      break;
    default:
      break;
    }

    set(dynamicHeader, 'translationKey', nueTranslationKey);

    next(() => {
      set(this, 'headers', headers);
    })


    return content.filter((row) => C.ACTIVEISH_STATES.includes(row.state) || row.type === 'globalRole');
  }),
});
