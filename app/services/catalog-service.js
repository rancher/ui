import Ember from 'ember';
import CatalogResource from 'ui/mixins/catalog-resource';
import { addQueryParam, addQueryParams } from 'ui/utils/util';

const VERSIONKEY = 'minimumRancherVersion_lte';
export default Ember.Service.extend(CatalogResource, {
  settings: Ember.inject.service(),
  store: Ember.inject.service('store'),

  refresh() {
    const store = this.get('store');

    return store.request({
      url: `${this.get('app.catalogEndpoint')}/templates?refresh&action=refresh`,
      method: 'POST',
      timeout: null, // I'm willing to wait...
    });
  },

  fetchCatalogs(auth) {
    const store = this.get('store');

    return this.get('projects').checkForWaiting(auth.get('hosts'),auth.get('machines')).then(() => {
      return store.request({url: `${this.get('app.catalogEndpoint')}/catalogs`});
    });
  },

  fetchAllTemplates(qp) {
    const store = this.get('store');
    let version = this.get('settings.rancherVersion');
    let url =`${this.get('app.catalogEndpoint')}/templates`;


    if (version) {
      url = addQueryParam(url, VERSIONKEY, version);
    }

    if (qp) {
      url = addQueryParams(url, qp);
    }

    return store.request({url: url});

  },

  fetchTemplate(param, upgrade=false) {
    const store = this.get('store');
    let version = this.get('settings.rancherVersion');
    let type = 'templates';

    if (upgrade) {
      type = 'templateversions';
    }

    let url = `${this.get('app.catalogEndpoint')}/${type}/${param}`;

    if (version) {
      url = addQueryParam(url, VERSIONKEY, version);
    }

    return store.request({url: url});
  },

});
