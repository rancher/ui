import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  settings         : Ember.inject.service(),
  projects         : Ember.inject.service(),
  catalogService   : Ember.inject.service(),

  cache            : null,
  catalogs         : null,
  uniqueCatalogIds : null,

  templateBase: Ember.computed.alias('projects.current.orchestration'),

  uniqKeys: function (data, name) {
    let out = data.map((item) => item[name]);
    out = out.uniq().sort((a,b) => a.localeCompare(b, 'en', {sensitivity: 'base'}));
    out.unshift('all');
    return out;
  },

  getCatalogs: function(params) {

    let cache        = this.get('cache');
    let templateBase = (params.templateBase || this.get('templateBase'));
    let version      = this.get('settings.rancherVersion');
    let catalogId    = params.catalogId;
    let plusInfra    = (params.plusInfra || false);
    let qp           = {
      'category_ne': 'system',
    };

    // If the catalogIds dont match we need to go get the other catalog from the store since we do not cache all catalogs
    if ( cache && cache.catalogId === catalogId)
    {
      return this.filter(cache, params.category, this.get('uniqueCatalogIds'), templateBase, plusInfra);
    }

    if (catalogId) {
      this.controllerFor('catalog-tab.index').set('selectedCatalog', catalogId);

      if (catalogId !== 'all') {
        qp['catalogId'] = catalogId;
      }
    }

    if ( version )
    {
      qp['minimumRancherVersion_lte'] = version;
    }

    return this.get('catalogService').fetchAllTemplates(qp).then((response) => {
      response.catalogId = catalogId;
      this.set('cache', response);
      return this.filter(response, params.category, this.get('uniqueCatalogIds'), templateBase, plusInfra);
    });
  },

  filter: function (data, category, catalogIds, templateBase, plusInfra) {
      let bases = [];
      if ( templateBase === 'cattle' ) {
        bases.push('');
      } else {
        bases.push(templateBase);
      }

      if ( plusInfra ) {
        bases.push(C.EXTERNAL_ID.KIND_INFRA);
      }

      data = data.filter((x) => bases.contains(x.get('templateBase')||''));

      let categories = this.uniqKeys(data, 'category');

      if ( category !== 'all' ) {
        data = data.filterBy('category', category);
      }

      data = data.sortBy('name');

      data.forEach((item) => {
        if (item.catalogId === C.CATALOG.LIBRARY_KEY) {
          Ember.set(item, 'official', true);
        }
      });

      return Ember.Object.create({
        categories: categories,
        uniqueCatalogIds: catalogIds,
        catalog: data,
        templateBase: templateBase,
      });
    },
});
