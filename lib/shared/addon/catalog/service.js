import { resolve, reject } from 'rsvp';
import Service, { inject as service } from '@ember/service';
import { addQueryParams, uniqKeys } from 'shared/utils/util';
import C from 'shared/utils/constants';
import EmberObject from '@ember/object'

const RANCHER_VERSION = 'rancherVersion';

export default Service.extend({
  globalStore:   service(),
  settings:      service(),
  store:         service('store'),
  scope:         service(),
  app: service(),

  templateCache: null,
  catalogs:      null,

  templateBase: '',

  reset() {
    this.setProperties({
      templateCache: null,
      catalogs: null,
    });
  },

  refresh() {
    const store = this.get('store');

    return this.fetchCatalogs().then(() => {
      this.set('templateCache', null);
      return store.request({
        url: `${this.get('app.apiEndpoint')}/templates?refresh&action=refresh`,
        headers: {[C.HEADER.PROJECT_ID]: this.get('scope.currentProject.id')},
        method: 'POST',
        timeout: null, // I'm willing to wait...
      });
    });
  },

  fetchCatalogs(opts) {
    return this.get('globalStore').findAll('catalog', opts);
  },

  getTemplateFromCache(id) {
    return this.get('store').getById('template', id);
  },

  getVersionFromCache(id) {
    return this.get('store').getById('templateversion', id);
  },

  fetchTemplate(id, upgrade=false) {
    let type, cached;
    if ( upgrade === true ) {
      type = 'templateversions';
      cached = this.getVersionFromCache(id);
    } else {
      type = 'templates';
      cached = this.getTemplateFromCache(id);
    }

    if ( cached ) {
      return resolve(cached);
    }

    let url = this._addLimits(`${this.get('app.apiEndpoint')}/${type}/${id}`);
    return this.get('store').request({
      url: url,
      headers: {
        [C.HEADER.PROJECT_ID]: this.get('scope.currentProject.id')
      }
    });
  },

  fetchTemplates(params) {
    params = params || {};

    let cache        = this.get('templateCache');
    let templateBase = params.templateBase || this.get('templateBase');
    let catalogId    = params.catalogId;
    let plusInfra    = (params.plusInfra || false);

    let qp           = {
      'category_ne': 'system',
    };

    if (catalogId && catalogId !== 'all') {
      qp['catalogId'] = catalogId;
    }

    // If the catalogIds dont match we need to go get the other catalog from the store since we do not cache all catalogs
    if ( cache && cache.catalogId === catalogId)
    {
      return resolve(this.filter(cache, params.category, templateBase, plusInfra));
    }

    let url = this._addLimits(`${this.get('app.apiEndpoint')}/templates`, qp);
    return this.get('store').request({url: url, headers: {[C.HEADER.PROJECT_ID]: this.get('scope.currentProject.id')}}).then((res) => {
      res.catalogId = catalogId;
      this.set('templateCache', res);
      return this.filter(res, params.category, templateBase, plusInfra);
    }).catch((err) => {
      if ( params.allowFailure ) {
        return this.filter([], params.category, templateBase, plusInfra);
      } else {
        return reject(err);
      }
    });
  },

  cleanVersionsArray(template) {
    return Object.keys(template.versionLinks).filter((key) => {
      // Filter out empty values for rancher/rancher#5494
      return !!template.versionLinks[key];
    }).map((key) => {
      return {version: key, sortVersion: key, link: template.versionLinks[key]};
    })
  },

  fetchByUrl(url) {
    return this.get('store').request({url: url, headers: {[C.HEADER.PROJECT_ID]: this.get('scope.currentProject.id')}});
  },

  filter(data, category, templateBase, plusInfra) {
    let bases = [templateBase];

    category = (category||'all').toLowerCase();

    if ( plusInfra ) {
      bases.push(C.EXTERNAL_ID.KIND_INFRA);
    }

    let categories = [];
    data.forEach((obj) => { categories.pushObjects(obj.get('categoryArray')); });
    categories = uniqKeys(categories);
    categories.unshift('all');

    data = data.filter((tpl) => {
      if ( category !== 'all' && !tpl.get('categoryLowerArray').includes(category) ) {
        return false;
      }

// @TODO-2.0
//      if ( !bases.includes(tpl.get('templateBase')) ) {
//        return false;
//      }

      return true;
    });

    data = data.sortBy('name');

    return EmberObject.create({
      categories: categories,
      catalog: data,
      templateBase: templateBase,
    });
  },

  _addLimits(url, qp) {
    let version = this.get('settings.rancherVersion');
    qp = qp || {};

    if (version) {
      qp[RANCHER_VERSION] = version;
    }

    url = addQueryParams(url, qp);

    return url;
  },
});
