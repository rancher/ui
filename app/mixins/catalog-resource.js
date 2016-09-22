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
    let combined     = false;
    let qp           = {
      'category_ne': 'system',
    };

    // If the catalogIds dont match we need to go get the other catalog from the store since we do not cache all catalogs
    if ( cache && cache.catalogId === catalogId)
    {
      return this.filter(cache, params.category, this.get('uniqueCatalogIds'), templateBase);
    }

    if (catalogId) {
      this.controllerFor('catalog-tab.index').set('selectedCatalog', catalogId);

      if (catalogId === 'library') {
        combined = true;
      } else if (catalogId !== 'all') {
        qp['catalogId'] = catalogId;
      }
    }

    if ( version )
    {
      qp['minimumRancherVersion_lte'] = version;
    }

    if (combined) {
      let hash = [];
      [C.CATALOG.LIBRARY_KEY,C.CATALOG.COMMUNITY_KEY].forEach((key) => {
        let tmpQp = qp;
        tmpQp['catalogId'] = key;
        hash.push(this.get('catalogService').fetchAllTemplates(tmpQp));
      });
      return Ember.RSVP.all(hash).then((arrays) => {
        let tmpArr = [];
        arrays.forEach((ary) => {
          tmpArr = tmpArr.concat(ary.content);
        });
        tmpArr.catalogId = catalogId;
        this.set('cache', tmpArr);
        return this.filter(tmpArr, params.category, this.get('uniqueCatalogIds'), templateBase);
      });
    } else {
      return this.get('catalogService').fetchAllTemplates(qp).then((response) => {
        response.catalogId = catalogId;
        this.set('cache', response);
        return this.filter(response, params.category, this.get('uniqueCatalogIds'), templateBase);
      });
    }

  },

  filter: function (data, category, catalogIds, templateBase) {
      data = data.filterBy('templateBase', (templateBase === 'cattle' ? '' : templateBase));
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
