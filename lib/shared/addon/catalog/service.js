import { resolve, reject } from 'rsvp';
import Service, { inject as service } from '@ember/service';
import { addQueryParams, uniqKeys } from 'shared/utils/util';
import C from 'shared/utils/constants';
import EmberObject from '@ember/object'
import {
  set, get, observer
} from '@ember/object';
import { /* parseExternalId, */ parseHelmExternalId } from 'ui/utils/parse-externalid';
import { allSettled } from 'rsvp';

const RANCHER_VERSION = 'rancherVersion';

export default Service.extend({
  globalStore:   service(),
  settings:      service(),
  store:         service('store'),
  scope:         service(),
  app:           service(),

  templateCache: null,
  catalogs:      null,

  _allCatalogs:  null,
  _refreshMap:   null,

  init() {
    this._super(...arguments);
    const store = get(this, 'globalStore');

    set(this, '_allCatalogs', store.all('catalog'));
    set(this, '_refreshMap', {});
  },

  catalogsDidChange: observer('_allCatalogs.@each.state', '_refreshMap', function() {
    if ( get(this, 'templateCache') !== null ) {
      const oldRefreshMap = get(this, '_refreshMap');
      const newRefreshMap = {};

      (get(this, '_allCatalogs') || []).forEach((c) => {
        newRefreshMap[get(c, 'id')] = get(c, 'lastRefreshTimestamp');
      });
      let needRefresh = false;

      for (let k of new Set([...Object.keys(newRefreshMap), ...Object.keys(oldRefreshMap)])) {
        if ( !oldRefreshMap.hasOwnProperty(k) || !newRefreshMap.hasOwnProperty(k) || oldRefreshMap[k] !== newRefreshMap[k] ) {
          needRefresh = true;
        }
      }
      set(this, 'needRefresh', needRefresh);
    }
  }),

  reset() {
    this.setProperties({
      templateCache: null,
      catalogs:      null,
    });
  },

  refresh() {
    const store = get(this, 'store');

    return this.fetchCatalogs().then(() => {
      this.set('templateCache', null);

      return store.request({
        method: 'POST',
        url:    `${ get(this, 'app.apiEndpoint') }/catalogs?action=refresh`,
      });
    });
  },

  fetchAppTemplates(apps) {
    let deps      = [];

    apps.forEach((app) => {
      let extInfo = parseHelmExternalId(app.get('externalId'));

      deps.push(this.fetchTemplate(extInfo.templateId, false));
    });

    return allSettled(deps);
  },

  fetchCatalogs(opts) {
    return get(this, 'globalStore').findAll('catalog', opts);
  },

  getTemplateFromCache(id) {
    return get(this, 'store').getById('template', id);
  },

  getVersionFromCache(id) {
    return get(this, 'store').getById('templateversion', id);
  },

  fetchTemplate(id, upgrade = false) {
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

    let url = this._addLimits(`${ get(this, 'app.apiEndpoint') }/${ type }/${ id }`);

    return get(this, 'store').request({
      url,
      headers: { [C.HEADER.PROJECT_ID]: get(this, 'scope.currentProject.id') }
    });
  },

  fetchTemplates(params) {
    params = params || {};

    let cache        = get(this, 'templateCache');
    let catalogId    = params.catalogId;

    let qp           = { 'category_ne': 'system', };

    if (catalogId && catalogId !== 'all') {
      qp['catalogId'] = catalogId;
    }

    // If the catalogIds dont match we need to go get the other catalog from the store since we do not cache all catalogs
    if ( cache && cache.catalogId === catalogId && !get(this, 'needRefresh') ) {
      return resolve(this.filter(cache, params.category));
    }

    const catalogs = get(this, '_allCatalogs');
    const refreshMap = {};

    catalogs.forEach((c) => {
      refreshMap[get(c, 'id')] = get(c, 'lastRefreshTimestamp');
    });
    set(this, '_refreshMap', refreshMap);

    let url = this._addLimits(`${ get(this, 'app.apiEndpoint') }/templates`, qp);

    return get(this, 'store').request({
      url,
      headers: { [C.HEADER.PROJECT_ID]: get(this, 'scope.currentProject.id') }
    }).then((res) => {
      res.catalogId = catalogId;
      this.set('templateCache', res);

      return this.filter(res, params.category);
    }).catch((err) => {
      if ( params.allowFailure ) {
        return this.filter([], params.category);
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
      return {
        version:     key,
        sortVersion: key,
        link:        template.versionLinks[key]
      };
    })
  },

  fetchByUrl(url) {
    return get(this, 'store').request({
      url,
      headers: { [C.HEADER.PROJECT_ID]: get(this, 'scope.currentProject.id') }
    });
  },

  filter(data, category) {
    category = (category || '').toLowerCase();

    let categories = [];

    data.forEach((obj) => {
      categories.pushObjects(obj.get('categoryArray'));
    });
    categories = uniqKeys(categories);
    categories.unshift('');

    data = data.filter((tpl) => {
      if ( category !== '' && !tpl.get('categoryLowerArray').includes(category) ) {
        return false;
      }

      return true;
    });

    data = data.sortBy('name');

    return EmberObject.create({
      categories,
      catalog:    data,
    });
  },

  _addLimits(url, qp) {
    let version = get(this, 'settings.rancherVersion');

    qp = qp || {};

    if (version) {
      qp[RANCHER_VERSION] = version;
    }

    url = addQueryParams(url, qp);

    return url;
  },
});
