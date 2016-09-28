import Ember from 'ember';
import CatalogResource from 'ui/mixins/catalog-resource';

export default Ember.Route.extend(CatalogResource, {
  catalogService: Ember.inject.service(),

  queryParams: {
    category: {
      refreshModel: true
    },
    catalogId: {
      refreshModel: true
    }
  },

  actions: {
    refresh: function() {
      // Clear the cache so it has to ask the server again
      this.set('cache', null);
      this.refresh();
    },
  },


  deactivate() {
    // Clear the cache when leaving the route so that it will be reloaded when you come back.
    this.set('cache', null);
  },

  beforeModel: function() {
    this._super(...arguments);

    var auth = this.modelFor('authenticated');

    return this.get('projects').checkForWaiting(auth.get('hosts'),auth.get('machines')).then(() => {
      return Ember.RSVP.hash({
        stacks: this.get('store').find('stack'),
        catalogs: this.get('catalogService').fetchCatalogs(),
      }).then((hash) => {
        this.set('catalogs', hash.catalogs);
        this.set('stacks', this.get('store').allUnremoved('stack'));

        let ids = this.uniqKeys(hash.catalogs, 'id');

        this.set('uniqueCatalogIds', ids);
      });
    });
  },

  model(params) {
    params.plusInfra = true;
    let stacks = this.get('stacks');
    return this.get('catalogService').getCatalogs(params).then((res) => {
      res.catalog.forEach((tpl) => {
        let exists = stacks.findBy('externalIdInfo.templateId', tpl.get('id'));
        tpl.set('exists', !!exists);

      });

      return res;
    });
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('category', 'all');
      controller.set('catalogId', 'all');
    }
  }
});
