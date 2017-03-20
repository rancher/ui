import Ember from 'ember';
import { isAlternate } from 'ui/utils/platform';
import C from 'ui/utils/constants';
import { getCatalogSubtree } from 'ui/utils/parse-catalog-setting';

export default Ember.Controller.extend({
  application:       Ember.inject.controller(),
  catalog:           Ember.inject.service(),
  settings:          Ember.inject.service(),
  projects:          Ember.inject.service(),
  projectId:         Ember.computed.alias(`tab-session.${C.TABSESSION.PROJECT}`),

  catalogController: Ember.inject.controller('catalog-tab'),
  category:          Ember.computed.alias('catalogController.category'),
  categories:        Ember.computed.alias('model.categories'),
  catalogId:         Ember.computed.alias('catalogController.catalogId'),
  modalService:      Ember.inject.service('modal'),

  parentRoute:       'catalog-tab',
  launchRoute:       'catalog-tab.launch',

  search:            '',

  updating:          'no',

  actions: {
    addEnvCatalog() {
      this.get('modalService').toggleModal('modal-edit-env-catalogs', {
        project: this.get('projects.current'),
        catalogs: this.get('model.catalogs.content'),
      });
    },
    clearSearch() {
      this.set('search', '');
    },
    launch(id, onlyAlternate) {
      if ( onlyAlternate && !isAlternate(event) ) {
        return false;
      }

      this.transitionToRoute(this.get('launchRoute'), id);
    },

    update() {
      this.set('updating', 'yes');
      this.get('catalog').refresh().then(() => {
        this.set('updating', 'no');
        this.send('refresh');
      }).catch(() => {
        this.set('updating', 'error');
      });
    }
  },

  init() {
    this._super(...arguments);
    this.get('catalog.componentRequestingRefresh');
  },

  childRequestiongRefresh: Ember.observer('catalog.componentRequestingRefresh', function() {
    if (this.get('catalog.componentRequestingRefresh')) {
      this.send('update');
    }
  }),

  categoryWithCounts: Ember.computed('category', 'categories', function() {
    var categories = [];
    var templates = this.get('catalog.templateCache');

    templates.forEach((tpl) => {
      if (tpl.categories) {
        tpl.categories.forEach((ctgy) => {
          if (categories.findBy('name', ctgy) && ctgy !== 'all') {
            categories.findBy('name', ctgy).count++;
          } else {
            categories.pushObject({name: ctgy, count: 1});
          }
        });
      }
    });
    return categories.sortBy('name');
  }),

  catalogURL: Ember.computed('model.catalogs', function() {
    var neu = {
      catalogs: {}
    };
    this.get('model.catalogs.content').forEach((cat) => {
      neu.catalogs[cat.id] = {
        branch: cat.branch,
        url: cat.url
      };
    });
    return JSON.stringify(neu);
  }),

  filters: Ember.computed('model.catalogs', function() {
    this.get(`settings.${C.SETTING.CATALOG_URL}`);
    return getCatalogSubtree(this.get('catalogURL'), this.get('projectId'));
  }),

  arrangedContent: Ember.computed('model.catalog', 'search', function() {
    var search = this.get('search').toUpperCase();
    var result = [];

    if (!search) {
      return this.get('model.catalog');
    }

    this.get('model.catalog').forEach((item) => {
      if (item.name.toUpperCase().indexOf(search) >= 0 || item.description.toUpperCase().indexOf(search) >= 0) {
        result.push(item);
      }
    });
    return result;
  }),
});
