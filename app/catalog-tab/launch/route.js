import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  modalService: service('modal'),
  catalog:      service(),

  parentRoute:  'catalog-tab',

  actions: {
    cancel() {
      this.get('modalService').toggleModal();
    },
  },
  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = {
      tpl: this.get('catalog').fetchTemplate(params.template),
    };

    if ( params.upgrade )
    {
      dependencies.upgrade = this.get('catalog').fetchTemplate(params.upgrade, true);
    }

    if ( params.stackId )
    {
      dependencies.stack = store.find('stack', params.stackId);
    }

    return hash(dependencies, 'Load dependencies').then((results) => {
      if ( !results.stack )
      {
        results.stack = store.createRecord({
          type: 'stack',
          name: results.tpl.get('defaultName'),
          system: (results.tpl.get('templateBase') === C.EXTERNAL_ID.KIND_INFRA),
          answers: {},
        });
      }

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
        stack: results.stack,
        tpl: results.tpl,
        upgrade: results.upgrade,
        versionLinks: links,
        versionsArray: verArr,
        allTemplates: this.modelFor(this.get('parentRoute')).get('catalog'),
        templateBase: this.modelFor(this.get('parentRoute')).get('templateBase'),
      });
    });
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('stackId', null);
      controller.set('upgrade', null);
    }
  }
});
