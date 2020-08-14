import { alias, union } from '@ember/object/computed';
import C from 'shared/utils/constants';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { observer, computed, get, set } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  catalog:      service(),
  prefs:        service(),
  settings:     service(),
  scope:        service(),
  modalService: service('modal'),
  layout,
  search:       '',
  parentRoute:  null,
  launchRoute:  null,
  updating:     'no',

  istio:        false,
  projectId:    alias(`cookies.${ C.COOKIE.PROJECT }`),
  catalogs:     union('model.catalogs.globalCatalogs', 'clusterCatalogs', 'projectCatalogs'),


  init() {
    this._super(...arguments);
    get(this, 'catalog.componentRequestingRefresh');
  },

  actions: {
    clearSearch() {
      set(this, 'search', '');
    },

    update() {
      set(this, 'updating', 'yes');
      get(this, 'catalog').refresh()
        .then(() => {
          set(this, 'updating', 'no');

          if (this.refresh) {
            this.refresh();
          }
        })
        .catch(() => {
          set(this, 'updating', 'error');
        });
    },

    filterCatalog(category, dropdown) {
      if (dropdown && dropdown.isOpen) {
        dropdown.actions.close();
      }

      this.categoryAction(category);
    },

    toggleCollapse(group) {
      const collapsedNames = get(this, `prefs.${ C.PREFS.COLLAPSED_CATALOGS }`) || [];

      if ( group.collapsed ) {
        collapsedNames.removeObject(group.name);
      } else {
        collapsedNames.addObject(group.name);
      }

      set(group, 'collapsed', !group.collapsed);
      set(this, `prefs.${ C.PREFS.COLLAPSED_CATALOGS }`, collapsedNames);
    }
  },

  childRequestiongRefresh: observer('catalog.componentRequestingRefresh', function() {
    if (get(this, 'catalog.componentRequestingRefresh')) {
      this.send('update');
    }
  }),

  projectCatalogs: computed('model.catalogs.projecCatalogs', function() {
    return (get(this, 'model.catalogs.projectCatalogs') || []).filter( (c) => c.projectId === get(this, 'scope.currentProject.id'));
  }),

  clusterCatalogs: computed('model.catalogs.clusterCatalogs', function() {
    return (get(this, 'model.catalogs.clusterCatalogs') || []).filter( (c) => c.clusterId === get(this, 'scope.currentCluster.id'));
  }),

  categories: computed('matchingSearch.@each.{category,categories}', function() {
    let map = {};

    get(this, 'matchingSearch').forEach((tpl) => {
      const categories = tpl.categories;

      if ( !categories ){
        return;
      }

      for ( let i = 0 ; i < categories.length ; i++ ) {
        let ctgy = categories[i];
        let normalized = ctgy.underscore();

        if (map[normalized] ) {
          map[normalized].count += 1;
        } else {
          map[normalized] = {
            name:     ctgy,
            category: normalized,
            count:    1,
          };
        }
      }
    });

    return Object.values(map);
  }),

  catalogURL: computed('catalogs', function() {
    var neu = { catalogs: {} };

    get(this, 'catalogs').forEach((cat) => {
      neu.catalogs[cat.id] = {
        branch: cat.branch,
        url:    cat.url
      };
    });

    return JSON.stringify(neu);
  }),

  inScopeTemplates: computed('catalog._allTemplates.@each.{name,id,catalogId}', 'scope.currentProject', 'istio', function() {
    const svc = get(this, 'catalog');

    return svc.filter(
      get(svc, '_allTemplates'),
      get(this, 'scope.currentProject'),
      get(this, 'istio')
    );
  }),

  matchingSearch: computed('inScopeTemplates.@each.{name,description}', 'search', function() {
    const search = (get(this, 'search') || '').toLowerCase();
    const all = get(this, 'inScopeTemplates');

    if ( !search ) {
      return all;
    }

    return all.filter((tpl) => (tpl.name && tpl.name.toLowerCase().includes(search)) || (tpl.description && tpl.description.toLowerCase().includes(search)));
  }),

  arrangedContent: computed('matchingSearch.@each.categoryLowerArray', 'category', function() {
    const category = (get(this, 'category') || '').toLowerCase();
    const all = get(this, 'matchingSearch').filter((tpl) => Object.keys(get(tpl, 'versionLinks') || {}).length > 0);

    if ( !category || category === 'all') {
      return all;
    }

    return all.filter((tpl) => get(tpl, 'categoryLowerArray').includes(category));
  }),

  groupedContent: computed('arrangedContent.[]', 'catalogs.@each.name', function() {
    const out = [];
    const collapsedNames = get(this, `prefs.${ C.PREFS.COLLAPSED_CATALOGS }`) || [];
    const all = get(this, 'arrangedContent');

    all.forEach((template) => {
      const entry = getOrCreateGroup(template.displayCatalogId);

      entry.items.push(template);
    });

    if (!isEmpty(out)) {
      out.forEach((c) => {
        const isHelm3 = c.items.any((i) => {
          const {
            catalogRef,
            clusterCatalog,
            projectCatalog
          } = i;

          if (( catalogRef && catalogRef.isHelm3 ) ||
              ( clusterCatalog && clusterCatalog.isHelm3 ) ||
              ( projectCatalog && projectCatalog.isHelm3 )) {
            return true;
          }
        });

        set(c, 'isHelm3', isHelm3);
      });
    }

    return out.sortBy('priority', 'name');

    function getOrCreateGroup(name){
      let entry = out.findBy('name', name);
      let priority = 0;

      if ( name === C.CATALOG.LIBRARY_KEY ) {
        priority = 1;
      } else if ( [C.CATALOG.HELM_STABLE_KEY, C.CATALOG.HELM_INCUBATOR_KEY, C.CATALOG.ALIBABA_APP_HUB_KEY].includes(name) ) {
        priority = 2;
      }

      if ( !entry ) {
        entry = {
          name,
          priority,
          collapsed: collapsedNames.includes(name),
          items:     [],
        }
        out.push(entry);
      }

      return entry;
    }
  }),
});
