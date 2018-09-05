import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get, set, setProperties } from '@ember/object';
import { randomStr } from 'shared/utils/util';

export default Route.extend({
  modalService: service('modal'),
  catalog:      service(),
  scope:        service(),
  clusterStore: service(),

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

    if ( params.namespaceId ) {
      dependencies.namespace = clusterStore.find('namespace', params.namespaceId);
    }

    return hash(dependencies, 'Load dependencies').then((results) => {
      let neuNSN = results.tpl.get('displayName');
      let dupe   = results.namespaces.findBy('id', neuNSN);

      if ( !results.namespace ) {
        let { newNamespaceName, newNS } = this.newNamespace(dupe, neuNSN);

        if ( dupe ) {
          neuNSN = newNamespaceName;
        }

        results.namespace = newNS;
      }

      let kind = 'helm';
      let neuApp = null;
      var links;

      links = results.tpl.versionLinks;

      var verArr = Object.keys(links).filter((key) => !!links[key])
        .map((key) => ({
          version:     key,
          sortVersion: key,
          link:        links[key]
        }));

      if (results.app) {
        if (get(params, 'clone')) {
          let { newNamespaceName, newNS } = this.newNamespace(dupe, neuNSN);

          if ( dupe ) {
            neuNSN = newNamespaceName;
          }

          results.namespace = newNS;

          neuApp = results.app.cloneForNew();
          set(neuApp, 'name', results.namespace.name);
        } else {
          neuApp = results.app;
        }
      } else {
        neuApp = store.createRecord({
          type: 'app',
          name: results.namespace.name,
        });
      }

      if ( neuApp.id ) {
        verArr.filter((ver) => ver.version === get(neuApp, 'externalIdInfo.version'))
          .forEach((ver) => {
            set(ver, 'version', `${ ver.version } (current)`);
          })
      }

      return EmberObject.create({
        allTemplates:    this.modelFor(get(this, 'parentRoute')).get('catalog'),
        catalogApp:      neuApp,
        namespace:       results.namespace,
        namespaces:      results.namespaces,
        tpl:             results.tpl,
        tplKind:         kind,
        upgradeTemplate: results.upgrade,
        versionLinks:    links,
        versionsArray:   verArr,
      });
    });
  },

  resetController(controller, isExiting/* , transition*/) {
    if (isExiting) {
      setProperties(controller, {
        appId:       null,
        catalog:     null,
        namespaceId: null,
        template:    null,
        upgrade:     null,
        clone:       null,
      });
    }
  },

  actions: {
    cancel() {
      get(this, 'modalService').toggleModal();
    },
  },

  newNamespace(duplicateName, newNamespaceName) {
    const suffix = randomStr(5, 'novowels');

    if ( duplicateName ) {
      newNamespaceName = `${ get(duplicateName, 'displayName') }-${ suffix }`;
    }

    const newNS = get(this, 'clusterStore').createRecord({
      type:      'namespace',
      name:      newNamespaceName,
      projectId: this.modelFor('authenticated.project').get('project.id'),
    });

    return {
      newNamespaceName,
      newNS
    };
  },
});
