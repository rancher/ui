import Component from '@ember/component';
import layout from './template';
import { get, set, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import Step from 'pipeline/mixins/step';

const DEFAULT_CONFIG = { path: './deployment.yaml',  };

export default Component.extend(Step, {
  catalog:     service(),
  scope:       service(),
  globalStore: service(),

  layout,

  config:          null,
  field:           'applyAppConfig',
  defaultConfig:   DEFAULT_CONFIG,
  loading:         false,

  init() {
    this._super(...arguments);
    this.initNamespace();
    this.initCatalog();
  },

  appDidChange: observer('config.applyAppConfig.catalogTemplate', function() {
    set(this, 'versions', null );
    const name = get(this, 'config.applyAppConfig.catalogTemplate');

    if ( !name ) {
      return;
    }
    const app = get(this, 'apps').findBy('id', name);

    const versions = [];

    if ( app ) {
      Object.keys(get(app, 'versionLinks') || {}).forEach((v) => {
        versions.push({
          id:   v,
          name: v
        });
      });
    }
    set(this, 'versions', versions);

    const version = get(this, 'config.applyAppConfig.version');

    if ( version ) {
      if ( !versions.findBy('id', version) ) {
        set(this, 'config.applyAppConfig.version', null);
      }
    } else if ( get(versions, 'length') ){
      set(this, 'config.applyAppConfig.version', get(this, 'versions.lastObject.id'));
    }
  }),

  catalogDidChange: observer('selectedCatalog', function() {
    const catalog = get(this, 'selectedCatalog');
    const apps = get(this, 'allApps').filter((app) => get(app, 'catalogId') === catalog || get(app, 'clusterCatalogId') === catalog || get(app, 'projectCatalogId') === catalog);

    set(this, 'apps', apps);
    const app = get(this, 'config.applyAppConfig.catalogTemplate');

    if ( !apps.findBy('id', app) ) {
      set(this, 'config.applyAppConfig.catalogTemplate', null);
    }
  }),

  namespaceDidChange: observer('namespace.id', 'namespace.name', function() {
    set(this, 'config.applyAppConfig.targetNamespace', get(this, 'namespace.id') || get(this, 'namespace.name'));
  }),

  initNamespace() {
    const namespaceId = get(this, 'config.applyAppConfig.targetNamespace');

    if ( namespaceId ) {
      set(this, 'namespace', { id: namespaceId });
    }
  },

  initCatalog() {
    const catalog = get(this, 'catalog');

    set(this, 'loading', true);
    catalog.fetchUnScopedCatalogs().then((hash) => {
      return catalog.fetchTemplates().then(() => {
        set(this, 'allApps', catalog._allTemplates);
        this.setCatalogs(hash);
      })
    }).finally(() => {
      set(this, 'loading', false);
    })
  },

  setCatalogs({
    globalCatalogs, clusterCatalogs, projectCatalogs
  }) {
    const clusterId = get(this, 'scope.currentCluster.id');
    const projectId = get(this, 'scope.currentProject.id');
    let catalogs = globalCatalogs.filter((c) => get(c, 'id') !== 'system-library');

    catalogs.pushObjects(projectCatalogs.filterBy('projectId', projectId));
    catalogs.pushObjects(clusterCatalogs.filterBy('clusterId', clusterId));

    set(this, 'catalogs', catalogs.map((obj) => ({
      name: obj.name || '',
      id:   obj.id,
    })));

    const templateId = get(this, 'config.applyAppConfig.catalogTemplate');

    if ( templateId ) {
      const c = get(this, 'allApps').findBy('id', templateId);

      if ( c ) {
        this.appDidChange();
      }
    }
  },

  validate() {
    const errors = [];

    this.validateField('catalogTemplate', errors);
    this.validateField('name', errors);
    this.validateField('version', errors);
    this.validateField('targetNamespace', errors);

    return errors;
  },

  validateField(key, errors) {
    const intl = get(this, 'intl');
    const config = get(this, 'config.applyAppConfig');

    if ( !get(config, key) || get(config, key).trim() === '' ) {
      errors.push(intl.t('generic.required', { key: intl.t(`newPipelineStep.stepType.applyApp.${ key }.label`) }));
    }
  }
});
