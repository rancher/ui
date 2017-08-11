import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  access: Ember.inject.service(),
  catalog: Ember.inject.service(),
  projects: Ember.inject.service(),

  queryParams: {
    category: { refreshModel: true },
    catalogId: { refreshModel: true },
    templateBase: { refreshModel: true },
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

    return this.get('projects').updateOrchestrationState().then(() => {
      return Ember.RSVP.hash({
        stacks: this.get('store').find('stack'),
        catalogs: this.get('catalog').fetchCatalogs({
          headers: {
            [C.HEADER.PROJECT_ID]: this.get('projects.current.id')
          },
        }),
      }).then((hash) => {
        this.set('catalogs', hash.catalogs);
        this.set('stacks', this.get('store').all('stack'));
      });
    });
  },

  model(params) {
    params.plusInfra = this.get('access').isOwner();
    let stacks = this.get('stacks');
    return this.get('catalog').fetchTemplates(params).then((res) => {
      res.catalog.forEach((tpl) => {
        let exists = stacks.findBy('externalIdInfo.templateId', tpl.get('id'));
        tpl.set('exists', !!exists);
      });
      res.catalogs = this.get('catalogs');

      return res;
    });
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('category', 'all');
      controller.set('templateBase', '');
    }
  }
});
