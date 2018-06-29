import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get, set } from '@ember/object';

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

      if ( !results.namespace ) {

        let neuNSN = results.tpl.get('displayName');
        let dupe = results.namespaces.findBy('id', neuNSN);

        if ( dupe ) {

          neuNSN = `${ get(dupe, 'displayName') }-${ Math.random().toString(36)
            .substring(7) }`; // generate a random 5 char string for the dupename

        }

        results.namespace = clusterStore.createRecord({
          type:      'namespace',
          name:      neuNSN,
          projectId: this.modelFor('authenticated.project').get('project.id'),
        });

      }

      let kind = 'helm';
      let neuApp = null;
      var links;

      links = results.tpl.versionLinks;

      var verArr = Object.keys(links).filter((key) => !!links[key]
      )
        .map((key) => ({
          version:     key,
          sortVersion: key,
          link:        links[key]
        }));

      if (results.app) {

        neuApp = results.app;

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
        namespaces:      results.namespaces,
        namespace:       results.namespace,
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

      controller.set('namespaceId', null);
      controller.set('template', null);
      controller.set('upgrade', null);
      controller.set('catalog', null);
      controller.set('appId', null);

    }

  },
  actions: {
    cancel() {

      get(this, 'modalService').toggleModal();

    },
  },
});
