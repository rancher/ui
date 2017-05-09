import Ember from 'ember';
import { isAlternate } from 'ui/utils/platform';
import C from 'ui/utils/constants';

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

  parentRoute: 'catalog-tab',
  launchRoute: 'catalog-tab.launch',

  search: '',

  updating: 'no',

  actions: {
    addEnvCatalog() {
      this.get('modalService').toggleModal('modal-edit-env-catalogs', {
        project: this.get('projects.current'),
        catalogs: this.get('catalog.catalogs'),
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

    },
    switch(catalog) {
      this.transitionToRoute(this.get('parentRoute'), this.get('projectId'), {queryParams: catalog.queryParams} );
    }
  },

  catalogURL: Ember.computed('model.catalogs', function() {
    var neu = {
      catalogs: {}
    };
    this.get('model.catalogs').forEach((cat) => {
      neu.catalogs[cat.id] = {
        branch: cat.branch,
        url: cat.url
      };
    });
    return JSON.stringify(neu);
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
