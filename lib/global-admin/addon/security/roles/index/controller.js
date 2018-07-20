import Controller from '@ember/controller';
import {
  computed, get, set, observer, setProperties
} from '@ember/object';
import FilterState from 'ui/mixins/filter-state';

const headers = [
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
    translationKey: 'generic.created',
    width:          250,
  },
];

export default Controller.extend(FilterState, {
  queryParams:       ['context'],

  sortBy:            'name',
  context:           'global',
  headers,
  searchText:        '',
  filterableContent: null,
  showOnlyDefaults:  false,

  actions: {
    changeView(viewName) {
      set(this, 'context', viewName);

      this.setContent();
    }
  },

  _showOnlyDefaults: observer('showOnlyDefaults', function() {
    this.send('changeView', get(this, 'context'));
  }),

  readableMode: computed('context', function() {
    return get(this, 'context').capitalize();
  }),

  globalRows: computed('filtered.@each.{name,state}', function() {
    return get(this, 'model.globalRoles');
  }),

  projectRows: computed('filtered.@each.{name,state}', function() {
    // context should not be blank but if it is include it here as well, we removed it from the UI but you could still create a role without context via api
    return get(this, 'model.roleTemplates').filter( (role ) => !get(role, 'hidden') && (get(role, 'context') !== 'cluster' || !role.hasOwnProperty('context')));
  }),

  clusterRows: computed('filtered.@each.{name,state}', function() {
    // context should not be blank but if it is include it here as well, we removed it from the UI but you could still create a role without context via api
    return get(this, 'model.roleTemplates').filter( (role ) => !get(role, 'hidden') && (get(role, 'context') !== 'project') || !role.hasOwnProperty('context'));
  }),

  model:             null,
  setContent() {
    let content         = null;
    const type          = get(this, 'context');
    const showDef       = get(this, 'showOnlyDefaults');
    const headers       = [...get(this, 'headers')];
    const dynamicHeader = headers.findBy('name', 'Default');

    switch (type) {
    case 'cluster':
      content = get(this, 'clusterRows');

      if (showDef) {
        content = content.filterBy('clusterCreatorDefault');
      }

      set(dynamicHeader, 'translationKey', 'rolesPage.index.table.cluster')

      break;
    case 'project':
      content = get(this, 'projectRows');

      if (showDef) {
        content = content.filterBy('projectCreatorDefault');
      }

      set(dynamicHeader, 'translationKey', 'rolesPage.index.table.project')

      break;
    case 'global':
      content = get(this, 'globalRows');

      if (showDef) {
        content = content.filterBy('newUserDefault');
      }

      set(dynamicHeader, 'translationKey', 'rolesPage.index.table.global')

      break;
    default:
      break;
    }

    setProperties(this, {
      filterableContent: content,
      headers
    })
  },

});
