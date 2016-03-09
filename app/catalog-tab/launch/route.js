import Ember from 'ember';

export default Ember.Route.extend({
  allServices: Ember.inject.service(),

  parentRoute: 'catalog-tab',

  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = {
      tpl: store.request({url: this.get('app.catalogEndpoint')+'/templates/'+params.template}),
    };

    if ( params.upgrade )
    {
      dependencies.upgrade = store.request({url: this.get('app.catalogEndpoint')+'/templateversions/'+params.upgrade});
    }

    if ( params.environmentId )
    {
      dependencies.env = store.find('environment', params.environmentId);
    }

    return Ember.RSVP.hash(dependencies, 'Load dependencies').then((results) => {
      if ( !results.env )
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

        results.env = store.createRecord({
          type: 'environment',
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

      var verArr = Object.keys(links).map((key) => {
        return {version: key, link: links[key]};
      });

      return Ember.Object.create({
        environment: results.env,
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
      controller.set('environmentId', null);
      controller.set('upgrade', null);
    }
  }
});
