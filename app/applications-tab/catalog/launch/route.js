import Ember from 'ember';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

export default Ember.Route.extend({
  allServices: Ember.inject.service(),

  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = {
      serviceChoices: this.get('allServices').choices(),
      tpl: ajaxPromise({url: this.get('app.catalogEndpoint')+'/templates/'+params.template, dataType: 'json'},true),
    };

    if ( params.upgrade )
    {
      dependencies.upgrade = ajaxPromise({url: this.get('app.catalogEndpoint')+'/upgradeinfo/'+params.upgrade, dataType: 'json'},true);
    }

    if ( params.environmentId )
    {
      dependencies.env = store.find('environment', params.environmentId);
    }

    return Ember.RSVP.hash(dependencies, 'Load dependencies').then((results) => {
      if ( !results.env )
      {
        results.env = store.createRecord({
          type: 'environment',
          environment: {}, // Question answers
        });
      }

      var links;
      if ( results.upgrade )
      {
        links = results.upgrade.newVersionLinks;
      }
      else
      {
        links = results.tpl.versionLinks;
      }

      var verArr = Object.keys(links).map((key) => {
        return {version: key, link: links[key]};
      });

      return Ember.Object.create({
        serviceChoices: results.serviceChoices,
        environment: results.env,
        tpl: results.tpl,
        upgrade: results.upgrade,
        versionLinks: links,
        versionsArray: verArr,
      });
    });
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('environmentId', null);
      controller.set('upgrade', null);
    }
  }
});
