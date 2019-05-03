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

  parentRoute:  'catalog-tab',

  model(params/* , transition*/) {
    var store = get(this, 'store');
    var clusterStore = get(this, 'clusterStore');

    var dependencies = {
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

    return hash(dependencies, 'Load dependencies').then((results) => {
      var def                = get(results, 'tpl.defaultVersion');
      var links              = get(results, 'tpl.versionLinks');
      var app                = get(results, 'app');
      var catalogTemplateUrl = null;

      if (app && params.appId && !params.upgrade) {
        def = get(app, 'externalIdInfo.version');
      }

      catalogTemplateUrl = links[def];

      var version = get(this, 'settings.rancherVersion');

      if ( version ) {
        catalogTemplateUrl = Util.addQueryParam(catalogTemplateUrl, 'rancherVersion', version);
      }

      return this.catalog.fetchByUrl(catalogTemplateUrl).then((catalogTemplate) => {
        let { requiredNamespace } = catalogTemplate;
        let namespaceName         = requiredNamespace ? requiredNamespace : results.tpl.get('displayName');
        let existingNamespace     = results.namespaces.findBy('id', namespaceName);
        let kind                  = 'helm';
        let neuApp                = null;
        let namespace             = null;
        let newAppName            = null;

        if (existingNamespace) {
          // If it already exists, use it.
          ( { namespace, newAppName } = {
            namespace:  existingNamespace,
            newAppName: this.dedupeName(existingNamespace.displayName)
          } );
        } else {
          ( { namespace, newAppName } = this.newNamespace(existingNamespace, namespaceName) );
        }

        var verArr = Object.keys(links).filter((key) => !!links[key])
          .map((key) => ({
            version:     key,
            sortVersion: key,
            link:        links[key]
          }));

        if (results.app) {
          if (get(params, 'clone')) {
            neuApp = results.app.cloneForNew();

            set(neuApp, 'name', this.dedupeName(get(namespace, 'displayName')));
          } else {
            neuApp = results.app;
          }
        } else {
          neuApp = store.createRecord({
            type: 'app',
            name: newAppName,
          });
        }

        if ( neuApp.id ) {
          verArr.filter((ver) => ver.version === get(neuApp, 'externalIdInfo.version'))
            .forEach((ver) => {
              set(ver, 'version', `${ ver.version } (current)`);
            })
        }

        return EmberObject.create({
          catalogTemplate,
          namespace,
          allTemplates:       this.modelFor(get(this, 'parentRoute')).get('catalog'),
          catalogApp:         neuApp,
          catalogTemplateUrl: links[def],
          namespaces:         results.namespaces,
          tpl:                results.tpl,
          tplKind:            kind,
          upgradeTemplate:    results.upgrade,
          versionLinks:       links,
          versionsArray:      verArr,
        });
      });
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
