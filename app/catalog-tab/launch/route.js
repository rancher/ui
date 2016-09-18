import Ember from 'ember';

export default Ember.Route.extend({
  allServices: Ember.inject.service(),
  catalogService   : Ember.inject.service(),

  parentRoute: 'catalog-tab',

  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = {
      tpl: this.get('catalogService').fetchTemplate(params.template),
    };

    if ( params.upgrade )
    {
      dependencies.upgrade = this.get('catalogService').fetchTemplate(params.upgrade, true);
    }

    if ( params.stackId )
    {
      dependencies.stack = store.find('stack', params.stackId);
    }

    return Ember.RSVP.hash(dependencies, 'Load dependencies').then((results) => {
      if ( !results.stack )
      {
        var name = results.tpl.id;
        var base = results.tpl.templateBase;
        name = name.replace(/^[^:\/]+[:\/]/,'');  // Strip the "catalog-name:"
        if ( base )
        {
          var idx = name.indexOf(base);
          if ( idx === 0 )
          {
            name = name.substr(base.length+1); // Strip the "template-base*"
          }
        }

        results.stack = store.createRecord({
          type: 'stack',
          name: name,
          startOnCreate: true,
          environment: {}, // Question answers
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
        return {version: key, link: links[key]};
      });

      if ( results.upgrade )
      {
        verArr.unshift({
          version: results.upgrade.version + ' (current)',
          link: results.upgrade.links.self
        });
      }

      return Ember.Object.create({
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
