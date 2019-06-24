import { resolve, reject } from 'rsvp';
import Service, { inject as service } from '@ember/service';
import { addQueryParams, uniqKeys } from 'shared/utils/util';
import EmberObject from '@ember/object'
import { set, get, observer, setProperties } from '@ember/object';
import { /* parseExternalId, */ parseHelmExternalId } from 'ui/utils/parse-externalid';
import { allSettled, hash } from 'rsvp';
import { union } from '@ember/object/computed';

const RANCHER_VERSION = 'rancherVersion';
const SYSTEM_CATALOG = 'system-library';

export default Service.extend({
  globalStore:     service(),
  settings:        service(),
  store:           service(),
  scope:           service(),
  app:             service(),

  templateCache:   null,
  catalogs:        null,

  _allCatalogs:    union('globalCatalogs', 'clusterCatalogs', 'projectCatalogs'),
  _allTemplates:   null,
  _refreshMap:     null,

  globalCatalogs:  null,
  clusterCatalogs: null,
  projectCatalogs: null,

  init() {
    this._super(...arguments);
    const store = get(this, 'globalStore');

    setProperties(this, {
      globalCatalogs:  store.all('catalog'),
      clusterCatalogs: store.all('clustercatalog'),
      projectCatalogs: store.all('projectcatalog'),
      '_allTemplates': store.all('template'),
      '_refreshMap':   {},
    });
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
    const store = get(this, 'globalStore');

    return this.fetchUnScopedCatalogs().then(() => {
      set(this, 'templateCache', null);

      return hash({
        projectCatalogs: store.request({
          method: 'POST',
          url:    `${ get(this, 'app.apiEndpoint') }/projectcatalogs?action=refresh`,
        }),
        clusterCatalogs: store.request({
          method: 'POST',
          url:    `${ get(this, 'app.apiEndpoint') }/clustercatalogs?action=refresh`,
        }),
        globalCatalogs:  store.request({
          method: 'POST',
          url:    `${ get(this, 'app.apiEndpoint') }/catalogs?action=refresh`,
        })
      });
    });
  },

  fetchAppTemplates(apps) {
    let deps      = [];

    apps.forEach((app) => {
      let extInfo = parseHelmExternalId(app.get('externalId'));

      if ( extInfo && extInfo.templateId ) {
        deps.push(this.fetchTemplate(extInfo.templateId, false));
      }
    });

    return allSettled(deps);
  },

  fetchMultiClusterAppTemplates(apps) {
    let deps      = [];

    apps.forEach((app) => {
      let extInfo = get(app, 'externalIdInfo');

      if ( extInfo && extInfo.templateId ) {
        deps.push(this.fetchTemplate(extInfo.templateId, false));
      }
    });

    return allSettled(deps);
  },

  fetchUnScopedCatalogs() {
    return hash({
      projectCatalogs: this.fetchCatalogs('projectCatalog'),
      clusterCatalogs: this.fetchCatalogs('clusterCatalog'),
      globalCatalogs:  this.fetchCatalogs('catalog')
    });
  },

  fetchCatalogs(catalogs = 'catalog', opts) {
    return get(this, 'globalStore').findAll(catalogs, opts);
  },

  getTemplateFromCache(id) {
    return get(this, 'globalStore').getById('template', id);
  },

  getVersionFromCache(id) {
    return get(this, 'globalStore').getById('templateversion', id);
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

    return get(this, 'globalStore').request({ url });
  },

  fetchTemplates(params) {
    params = params || {};

    let cache     = get(this, 'templateCache');
    let catalogId = null;
    let qp        = { 'category_ne': 'system', };
    let project = params.project ? params.project : null;
    let currentProjectId = project ? project.id.split(':')[1] : null;
    let currentClusterId = project ? project.clusterId : null;

    if (params.catalogId) {
      catalogId = params.catalogId;

      if (catalogId && catalogId !== 'all') {
        qp['catalogId'] = catalogId;
      }
    } else if (params.clusterCatalogId) {
      catalogId = params.clusterCatalogId;

      if (catalogId && catalogId !== 'all') {
        qp['clusterCatalogId'] = catalogId;
      }
    } else if (params.projectCatalogId) {
      catalogId = params.projectCatalogId;

      if (catalogId && catalogId !== 'all') {
        qp['projectCatalogId'] = catalogId;
      }
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

    return get(this, 'globalStore').request({ url, }).then((res) => {
      res.catalogId = catalogId;

      if (catalogId === 'all' || !catalogId) {
        set(this, 'templateCache', res.filter((t) => {
          this;
          if (t.clusterId && currentClusterId) {
            if (t.clusterId === currentClusterId) {
              return t;
            }
          } else if (t.projectId && currentProjectId) {
            if (t.projectId === currentProjectId) {
              return t;
            }
          } else {
            return t;
          }
        }));
      } else {
        set(this, 'templateCache', res);
      }

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
    return get(this, 'store').request({ url });
  },

  filter(data, category) {
    category = (category || '').toLowerCase();

    let categories = [];

    data.forEach((obj) => {
      if ( get(obj, 'catalogId') !== SYSTEM_CATALOG ) {
        categories.pushObjects(obj.get('categoryArray'));
      }
    });
    categories = uniqKeys(categories);
    categories.unshift('');

    data = data.filter((tpl) => {
      if ( category !== '' && !tpl.get('categoryLowerArray').includes(category) ) {
        return false;
      }

      return get(tpl, 'catalogId') !== SYSTEM_CATALOG;
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
