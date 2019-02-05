import { alias, union } from '@ember/object/computed';
import C from 'shared/utils/constants';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { observer, computed, get, set } from '@ember/object';


export default Component.extend({
  catalog:      service(),
  settings:     service(),
  scope:        service(),
  modalService: service('modal'),
  layout,
  search:       '',
  parentRoute:  null,
  launchRoute:  null,
  updating:     'no',

  projectId:    alias(`cookies.${ C.COOKIE.PROJECT }`),
  categories:   alias('model.categories'),
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
          this.sendAction('refresh');
        })
        .catch(() => {
          set(this, 'updating', 'error');
        });
    }
  },

  childRequestiongRefresh: observer('catalog.componentRequestingRefresh', function() {
    if (get(this, 'catalog.componentRequestingRefresh')) {
      this.send('update');
    }
  }),

  projectCatalogs: computed('model.catalogs.projecCatalogs', function() {
    return get(this, 'model.catalogs.projectCatalogs').filter( (c) => c.projectId === get(this, 'scope.currentProject.id'));
  }),

  clusterCatalogs: computed('model.catalogs.clusterCatalogs', function() {
    return get(this, 'model.catalogs.clusterCatalogs').filter( (c) => c.clusterId === get(this, 'scope.currentCluster.id'));
  }),

  totalCategories: computed('categoryWithCounts', function() {
    var categories = get(this, 'categoryWithCounts');
    var count      = 0;

    Object.keys(categories).forEach((cat) => {
      count = count + categories[cat].count;
    });

    return count;
  }),

  categoryWithCounts: computed('category', 'categories', function() {
    let categories = [];
    let out        = {};
    let templates  = get(this, 'catalog.templateCache');

    templates.forEach((tpl) => {
      if (tpl.categories) {
        tpl.categories.forEach((ctgy) => {
          categories.push(ctgy);
        });
      }
    });

    categories.sort().forEach((ctgy) => {
      let normalized = ctgy.underscore();

      if (out[normalized] && ctgy) {
        out[normalized].count++;
      } else {
        out[normalized] = {
          name:     ctgy,
          category: normalized,
          count:    1,
        };
      }
    });

    const list = [];

    Object.keys(out).forEach((key) => {
      list.push(out[key]);
    });

    return list;
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

  filters: computed('catalogs', function() {
    return get(this, 'catalogs').filter((obj) => get(obj, 'id') !== 'system-library').map((obj) => ({
      catalogId: get(obj, 'id'),
      label:     get(obj, 'name'),
      scope:     get(obj, 'type'),
    }));
  }),

  arrangedContent: computed('model.catalog', 'search', function() {
    let search           = get(this, 'search').toUpperCase();
    let result           = [];
    let catalog          = get(this, 'model.catalog');
    let currentProjectId = get(this, 'scope.currentProject.id');
    let currentClusrerId = get(this, 'scope.currentCluster.id');

    catalog = catalog.filter( (item) => {
      let { projectCatalogId, clusterCatalogId, } = item;

      if (projectCatalogId && currentProjectId) {
        if (projectCatalogId.split(':').firstObject === currentProjectId.split(':')[1]) {
          return item;
        }
      } else if (clusterCatalogId && currentClusrerId) {
        if (clusterCatalogId.split(':')[0] === currentClusrerId) {
          return item;
        }
      } else if (item.isGlobalCatalog) {
        return item;
      }
    });

    if (!search) {
      return catalog;
    }

    catalog.forEach((item) => {
      if (item.name.toUpperCase().indexOf(search) >= 0 || item.description.toUpperCase().indexOf(search) >= 0) {
        result.push(item);
      }
    });

    return result;
  }),
});
