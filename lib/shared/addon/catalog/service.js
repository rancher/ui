import { resolve } from 'rsvp';
import Service, { inject as service } from '@ember/service';
import { addQueryParams, uniqKeys } from 'shared/utils/util';
import { get, setProperties } from '@ember/object';
import { /* parseExternalId, */ parseHelmExternalId } from 'ui/utils/parse-externalid';
import { allSettled, hash } from 'rsvp';
import { union } from '@ember/object/computed';
import C from 'shared/utils/constants';

export default Service.extend({
  globalStore:     service(),
  settings:        service(),
  store:           service(),
  scope:           service(),
  app:             service(),

  catalogs:        null,

  _allCatalogs:    union('globalCatalogs', 'clusterCatalogs', 'projectCatalogs'),
  _allTemplates:    null,

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
      '_allTemplates':  store.all('template'),
    });
  },

  reset() {
    this.setProperties({ catalogs: null });
  },

  refresh() {
    const store = get(this, 'globalStore');

    return this.fetchUnScopedCatalogs().then(() => {
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

  fetchTemplates() {
    if ( arguments.length ) {
      console.error('Deprecated', new Error("Use a catalogService.filter(globalStore.all('templates'))"));
    }

    const globalStore = get(this, 'globalStore');
    const qp  = { 'category_ne': 'system' };
    const url = this._addLimits(`${ get(this, 'app.apiEndpoint') }/templates`, qp);

    return globalStore.request({ url }).then(() => ({ catalog: this._allTemplates }));
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

  filter(data, project, istio) {
    let currentProjectId = project ? project.id : null;
    let currentClusterId = project ? project.clusterId : null;

    data = data.filter((tpl) => {
      if ( tpl.clusterId && tpl.clusterId !== currentClusterId ) {
        return false;
      }

      if ( tpl.projectId && tpl.projectId !== currentProjectId ) {
        return false;
      }

      if ( typeof istio !== undefined ) {
        if ( istio !== get(tpl, 'isIstio') ) {
          return false;
        }

        if ( !istio && get(tpl, 'catalogId') === C.CATALOG.SYSTEM_LIBRARY_KEY ) {
          return false;
        }
      }

      return true;
    });

    data = data.sortBy('name');

    return data;
  },

  uniqueCategories(data) {
    let out = [];

    data.forEach((obj) => {
      out.pushObjects(obj.get('categoryArray'));
    });

    out = uniqKeys(out);
    out.unshift('');

    return out;
  },

  _addLimits(url, qp) {
    qp = qp || {};
    url = addQueryParams(url, qp);

    return url;
  },
});
