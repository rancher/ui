import Ember from 'ember';
import { addQueryParams, uniqKeys } from 'ui/utils/util';
import C from 'ui/utils/constants';

const MIN_VERSION = 'minimumRancherVersion_lte';
const MAX_VERSION = 'maximumRancherVersion_gte';

export default Ember.Service.extend({
  settings: Ember.inject.service(),
  store: Ember.inject.service('store'),
  userStore: Ember.inject.service('user-store'),
  projects : Ember.inject.service(),

  templateCache    : null,
  catalogs         : null,

  templateBase: Ember.computed('projects.current.orchestration', function() {
    return this.get('projects.current.orchestration') || 'cattle';
  }),

  reset() {
    this.setProperties({
      templateCache: null,
      catalogs: null,
    });
  },

  refresh() {
    const store = this.get('store');

    this.reset();
    return store.request({
      url: `${this.get('app.catalogEndpoint')}/templates?refresh&action=refresh`,
      method: 'POST',
      timeout: null, // I'm willing to wait...
    });
  },

  fetchCatalogs() {
    return this.get('store').request({url: `${this.get('app.catalogEndpoint')}/catalogs`});
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
      return Ember.RSVP.resolve(cached);
    }

    let url = this._addLimits(`${this.get('app.catalogEndpoint')}/${type}/${id}`);
    return this.get('store').request({url: url});
  },

  fetchTemplates(params) {
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
      return Ember.RSVP.resolve(this.filter(cache, params.category, templateBase, plusInfra));
    }

    let url = this._addLimits(`${this.get('app.catalogEndpoint')}/templates`, qp);
    return this.get('store').request({url: url}).then((res) => {
      res.catalogId = catalogId;
      this.set('templateCache', res);
      return this.filter(res, params.category, templateBase, plusInfra);
    }).catch((err) => {
      if ( params.allowFailure ) {
        return this.filter([], params.category, templateBase, plusInfra);
      } else {
        return Ember.RSVP.reject(err);
      }
    });
  },

  filter(data, category, templateBase, plusInfra) {
    let bases = [];

    category = (category||'all').toLowerCase();

    if ( templateBase === 'cattle' ) {
      bases.push('');
    } else {
      bases.push(templateBase);
    }

    if ( plusInfra ) {
      bases.push(C.EXTERNAL_ID.KIND_INFRA);
    }

    let categories = uniqKeys(data, 'category');
    categories.unshift('all');

    data = data.filter((tpl) => {
      if ( category !== 'all' && (tpl.get('category')||'').toLowerCase() !== category ) {
        return false;
      }

      if ( !bases.includes(tpl.get('templateBase')||'') ) {
        return false;
      }

      return true;
    });

    data = data.sortBy('name');

    return Ember.Object.create({
      categories: categories,
      catalog: data,
      templateBase: templateBase,
    });
  },

  _addLimits(url, qp) {
    let version = this.get('settings.rancherVersion');
    qp = qp || {};

    if (version) {
      qp[MIN_VERSION] = version;
      qp[MAX_VERSION] = version;
    }

    url = addQueryParams(url, qp);

    return url;
  },
});
