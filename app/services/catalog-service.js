import Ember from 'ember';
import CatalogResource from 'ui/mixins/catalog-resource';
import { addQueryParam, addQueryParams } from 'ui/utils/util';
import FilteredSorted from 'ui/utils/filtered-sorted-array-proxy';

const VERSIONKEY = 'minimumRancherVersion_lte';
export default Ember.Service.extend(CatalogResource, {
  settings: Ember.inject.service(),
  store: Ember.inject.service('store'),
  userStore: Ember.inject.service('user-store'),

  refresh() {
    const store = this.get('store');

    return store.request({
      url: `${this.get('app.catalogEndpoint')}/templates?refresh&action=refresh`,
      method: 'POST',
      timeout: null, // I'm willing to wait...
    });
  },

  fetchCatalogs() {
    return this.get('store').request({url: `${this.get('app.catalogEndpoint')}/catalogs`});
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

  fetchSystemTemplates() {
    return this.fetchAllTemplates({
      templateBase: 'infra',
    }).then((all) => {
      return FilteredSorted.create({
        sourceContent: all,
        dependentKeys: ['templateBase'],
        filterFn: function(obj)  {
          return obj.get('templateBase') === 'infra';
        },
      });
    });
  },

  fetchSystemStacks(projectId) {
    this.get('userStore').resetType('stack');
    return this.get('userStore').find('stack', null, {filter: {accountId: projectId, system: 'true'}}).then(() => {
      return FilteredSorted.create({
        sourceContent: this.get('userStore').all('stack'),
        dependentKeys: ['accountId'],
        filterFn: function(obj)  {
          return obj.get('accountId') === projectId && obj.get('system') === true;
        },
      });
    });
  },
});
