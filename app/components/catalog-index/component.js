import { alias } from '@ember/object/computed';
import C from 'shared/utils/constants';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import {
  observer, computed, get
} from '@ember/object';


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

  projectId:       alias(`cookies.${ C.COOKIE.PROJECT }`),
  categories:      alias('model.categories'),
  totalCategories: computed('categoryWithCounts', function() {

    var categories = this.get('categoryWithCounts');
    var count = 0;

    Object.keys(categories).forEach((cat) => {

      count = count + categories[cat].count;

    });

    return count;

  }),

  categoryWithCounts: computed('category', 'categories', function() {

    let categories = [];
    let out = {};
    let templates  = this.get('catalog.templateCache');

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

  catalogURL: computed('model.catalogs', function() {

    var neu = { catalogs: {} };

    this.get('model.catalogs').forEach((cat) => {

      neu.catalogs[cat.id] = {
        branch: cat.branch,
        url:    cat.url
      };

    });

    return JSON.stringify(neu);

  }),

  filters: computed('model.catalogs', function() {

    return this.get('globalStore').all('catalog')
      .map((obj) => ({
        catalogId: get(obj, 'id'),
        label:     get(obj, 'name'),
      }));

  }),

  arrangedContent: computed('model.catalog', 'search', function() {

    let search  = this.get('search').toUpperCase();
    let result  = [];
    let catalog = this.get('model.catalog');

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
  childRequestiongRefresh: observer('catalog.componentRequestingRefresh', function() {

    if (this.get('catalog.componentRequestingRefresh')) {

      this.send('update');

    }

  }),

  init() {

    this._super(...arguments);
    this.get('catalog.componentRequestingRefresh');

  },

  actions: {
    clearSearch() {

      this.set('search', '');

    },
    update() {

      this.set('updating', 'yes');
      this.get('catalog').refresh()
        .then(() => {

          this.set('updating', 'no');
          this.sendAction('refresh');

        })
        .catch(() => {

          this.set('updating', 'error');

        });

    }
  },

});
