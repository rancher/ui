import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get, set } from '@ember/object';

export default Route.extend({
  modalService: service('modal'),
  catalog:      service(),
  scope: service(),

  parentRoute:  'catalog-tab',

  actions: {
    cancel() {
      get(this, 'modalService').toggleModal();
    },
  },
  model: function(params/*, transition*/) {
    var store = get(this, 'store');

    var dependencies = {
      tpl: get(this, 'catalog').fetchTemplate(params.template),
    };

    if ( params.upgrade )
    {
      dependencies.upgrade = get(this, 'catalog').fetchTemplate(params.upgrade, true);
    }

    if ( params.namespaceId )
    {
      dependencies.namespace = store.find('namespace', params.namespaceId);
    }

    dependencies.namespaces = store.find('namespace');

    return hash(dependencies, 'Load dependencies').then((results) => {
      let newNS = store.createRecord({
        type: 'namespace',
        name: '',
        answers: {},
      });
      let newNSName = '';

      if ( results.namespace ) {
        newNSName = `${results.tpl.get('defaultName')}-1`;
      } else {
        if ((results.namespaces||[]).findBy('name', results.tpl.get('defaultName'))) {
          newNSName = `${results.tpl.get('defaultName')}-1`;
        } else {
          newNSName = results.tpl.get('defaultName');
        }
      }

      set(newNS, 'name', newNSName);

      results.namespace = newNS;

      var links;

      if ( results.upgrade ) {
        links = results.upgrade.upgradeVersionLinks;
      } else {
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
        namespace: results.namespace,
        tpl: results.tpl,
        upgrade: results.upgrade,
        versionLinks: links,
        versionsArray: verArr,
        allTemplates: this.modelFor(get(this, 'parentRoute')).get('catalog'),
        templateBase: this.modelFor(get(this, 'parentRoute')).get('templateBase'),
        catalogApp: store.createRecord({
          type: 'app', // should be app after new api
          externalID: null,
          installNamespace: results.namespace.name,
          name: results.namespace.name,
        }),
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
