import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get, set, setProperties } from '@ember/object';
import { randomStr } from 'shared/utils/util';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

export default Route.extend({
  modalService: service('modal'),
  catalog:      service(),
  scope:        service(),
  clusterStore: service(),
  settings:     service(),
  growl:        service(),
  intl:         service(),

  parentRoute:  'catalog-tab',

  model(params, transition) {
    const { store, clusterStore } = this;

    const dependencies = {
      tpl:        get(this, 'catalog').fetchTemplate(params.template),
      namespaces: clusterStore.findAll('namespace')
    };

    if ( params.upgrade ) {
      dependencies.upgrade = get(this, 'catalog').fetchTemplate(`${ params.template }-${ params.upgrade }`, true);
    }

    if (params.appId) {
      dependencies.app = store.find('app', params.appId);
    }
    if (params.appName) {
      dependencies.app = store.find('app', null, { filter: { name: params.appName } }).then((apps) => get(apps, 'firstObject'));
    }

    if ( params.namespaceId ) {
      dependencies.namespace = clusterStore.find('namespace', params.namespaceId);
    }

    // check to see if we navigated here naturally or page refresh
    const routeInfos = this.router._router._routerMicrolib.currentRouteInfos;

    if (routeInfos && routeInfos.findBy('name', 'apps-tab.index')) {
      // if natural get teh apps model from the already loaded route
      let appsModel = this.modelFor('apps-tab.index');

      dependencies.apps = get(appsModel, 'apps');
    } else {
      dependencies.apps = store.findAll('app');
    }

    return hash(dependencies, 'Load dependencies').then((results) => {
      var def                = get(results, 'tpl.defaultVersion');
      var links              = get(results, 'tpl.versionLinks');
      var app                = get(results, 'app');
      var catalogTemplateUrl = null;
      const allApps          = get(results, 'apps');

      if (app && params.appId && (!params.upgrade || params.istio)) {
        def = get(app, 'externalIdInfo.version');
      }

      if ( !links[def] ) {
        def = get(results, 'tpl.latestVersion');
      }

      catalogTemplateUrl = links[def];

      var version = get(this, 'settings.rancherVersion');

      if ( version ) {
        catalogTemplateUrl = Util.addQueryParam(catalogTemplateUrl, 'rancherVersion', version);
      }

      return this.catalog.fetchByUrl(catalogTemplateUrl).then((catalogTemplate) => {
        let { requiredNamespace } = catalogTemplate;
        let namespaceName;

        // if we have a required ns or we're upgrading we wont need a new namespace name
        if (requiredNamespace || params.upgrade) {
          if ( requiredNamespace ) {
            namespaceName = requiredNamespace;
          } else {
            namespaceName = results.namespace.name;
          }
        } else {
          namespaceName = results.tpl.get('displayName');
        }

        let existingNamespace     = results.namespaces.findBy('id', namespaceName);
        let kind                  = 'helm';
        let neuApp                = null;
        let namespace             = null;
        let newAppName            = null;
        let match                 = null;

        if (existingNamespace) {
          // find any apps that exist in the ns so we can reuse if not
          if (allApps && allApps.length > 0) {
            match    = allApps.findBy('name', existingNamespace.displayName);
          }

          if (requiredNamespace || params.upgrade) {
            namespace = existingNamespace;
          } else {
            // no apps exist in the namespace that match our current ns name so we can reuse the ns
            if (match) {
              ( { namespace } = this.newNamespace(existingNamespace, namespaceName) );
            } else {
              namespace = existingNamespace;
            }
          }

          if (match && match.name !== C.STORAGE.LONGHORN_CATALOG_ITEM_DEFAULT_NAME) {
            newAppName = this.dedupeName(existingNamespace.displayName);
          } else {
            newAppName = existingNamespace.displayName;
          }
        } else {
          // new namespace
          ( { namespace, newAppName } = this.newNamespace(existingNamespace, namespaceName));
        }

        if ( params.istio ) {
          newAppName = '';
        }

        let verArr = Object.keys(links).filter((key) => !!links[key])
          .map((key) => ({
            version:     key,
            sortVersion: key,
            link:        links[key]
          }));

        if (results.app) {
          if (get(params, 'clone')) {
            neuApp = results.app.cloneForNew();

            set(neuApp, 'name', newAppName);
          } else {
            neuApp = results.app.clone();
          }
        } else {
          neuApp = this.store.createRecord({
            type: 'app',
            name: newAppName,
          });
        }

        let catalogTemplateUrlKey = def;

        if ( neuApp.id ) {
          const v = get(neuApp, 'externalIdInfo.version');
          const currentVersion = verArr.filter((ver) => ver.version === v);

          if ( currentVersion.length === 0 ) {
            verArr.unshift({
              link:        get(verArr, 'firstObject.link').substring(0, get(verArr, 'firstObject.link.length') - get(verArr, 'firstObject.version.length')) + v,
              sortVersion: v,
              version:     `${ v } (current)`
            })
          } else {
            currentVersion.forEach((ver) => {
              set(ver, 'version', `${ ver.version } (current)`);
            });
            catalogTemplateUrlKey = v;
          }
        }

        if ( !params.namespaceId && params.istio ) {
          namespace = null;
        }

        return EmberObject.create({
          catalogTemplate,
          namespace,
          catalogApp:         neuApp,
          catalogTemplateUrl: links[catalogTemplateUrlKey], // catalogTemplateUrl gets qp's added and this needs with out
          namespaces:         results.namespaces,
          tpl:                results.tpl,
          tplKind:            kind,
          upgradeTemplate:    results.upgrade,
          versionLinks:       links,
          versionsArray:      verArr,
        });
      });
    }).catch((error) => {
      if (error.status === 404) {
        this.growl.fromError(this.intl.t('newCatalog.error.appData'), error.message);
      }

      return transition.router.transitionTo('apps-tab.index');
    });
  },

  resetController(controller, isExiting/* , transition*/) {
    if (isExiting) {
      setProperties(controller, {
        appId:       null,
        appName:     null,
        catalog:     null,
        clone:       null,
        namespaceId: null,
        template:    null,
        upgrade:     null,
        istio:       false,
      });
    }
  },

  deactivate() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, undefined);
  },

  actions: {
    cancel() {
      get(this, 'modalService').toggleModal();
    },
  },

  dedupeName(name) {
    const suffix = randomStr(5, 5, 'novowels');

    return `${ name }-${ suffix }`;
  },

  newNamespace(duplicateNamespace, namespaceName) {
    let newAppName = namespaceName;

    if ( duplicateNamespace ) {
      newAppName = this.dedupeName(get(duplicateNamespace, 'displayName'));
    }

    const namespace = get(this, 'clusterStore').createRecord({
      type:      'namespace',
      name:      newAppName,
      projectId: this.modelFor('authenticated.project').get('project.id'),
    });

    return {
      namespace,
      newAppName,
    };
  },
});
