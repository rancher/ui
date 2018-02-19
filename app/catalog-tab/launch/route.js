import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get/* , set */ } from '@ember/object';

export default Route.extend({
  modalService: service('modal'),
  catalog:      service(),
  scope: service(),
  clusterStore: service(),

  parentRoute:  'catalog-tab',

  actions: {
    cancel() {
      get(this, 'modalService').toggleModal();
    },
  },
  model: function(params/*, transition*/) {
    var store = get(this, 'store');
    var clusterStore = get(this, 'clusterStore');

    var dependencies = {
      tpl: get(this, 'catalog').fetchTemplate(params.template),
      namespaces: clusterStore.findAll('namespace')
    };

    if ( params.upgrade )
    {
      dependencies.upgrade = get(this, 'catalog').fetchTemplate(params.upgrade, true);
    }

    if ( params.namespaceId )
    {
      dependencies.namespace = clusterStore.find('namespace', params.namespaceId);
    }

    return hash(dependencies, 'Load dependencies').then((results) => {
      if ( !results.namespace )
      {
        let neuNSN = results.tpl.get('defaultName');
        let dupe = '';

        if ( dupe = results.namespaces.findBy('id', neuNSN)){
          neuNSN = `${dupe.name}-${Math.random().toString(36).substring(7)}`; // generate a random 5 char string for the dupename
        }
        results.namespace = clusterStore.createRecord({
          type: 'namespace',
          name: neuNSN,
          projectId: this.modelFor('authenticated.project').get('project.id'),
          answers: {},
        });
      }

      let tplCatalog = this.modelFor(get(this, 'parentRoute')).get('catalogs').findBy('id', get(results, 'tpl.catalogId'));
      let kind = get(tplCatalog, 'kind') ? get(tplCatalog, 'kind') : 'native';
      var links;
      if ( results.upgrade )
      {
        links = results.upgrade.upgradeVersionLinks;
      }
      else
      {
        links = results.tpl.versionLinks;
      }

      var verArr = Object.keys(links).filter((key) => {
        // Filter out empty values for rancher/rancher#5494
        return !!links[key];
      }).map((key) => {
        return {version: key, sortVersion: key, link: links[key]};
      });

      if ( results.upgrade )
      {
        verArr.unshift({
          sortVersion: results.upgrade.version,
          version: results.upgrade.version + ' (current)',
          link: results.upgrade.links.self
        });
      }

      return EmberObject.create({
        allTemplates: this.modelFor(get(this, 'parentRoute')).get('catalog'),
        catalogApp: store.createRecord({
          type: 'app', // should be app after new api
          name: results.namespace.name,
          answers: [],
        }),
        namespace: results.namespace,
        templateBase: this.modelFor(get(this, 'parentRoute')).get('templateBase'),
        tpl: results.tpl,
        tplKind: kind,
        upgrade: results.upgrade,
        versionLinks: links,
        versionsArray: verArr,
      });
    });
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('namespaceId', null);
      controller.set('upgrade', null);
    }
  }
});
