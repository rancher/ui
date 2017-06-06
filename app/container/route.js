import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {

    return this.get('store').find('container', params.container_id).then((container) => {

      return Ember.RSVP.hash({
        ports:         container.followLink('ports'),
        hosts:         this.get('store').findAll('host'),
        instanceLinks: container.followLink('instanceLinks'),
      }).then((hash) => {

        return {
          container:     container,
          ports:         hash.ports,
          hosts:         hash.hosts,
          instanceLinks: hash.instanceLinks,
        };
      });
    });
  },
  afterModel(model) {
    var iLinks = model.instanceLinks;
    var linkedInstances = [];

    iLinks.forEach((link) => {
      linkedInstances.push(this.get('store').getById('container', link.get('targetInstanceId')));
    });

    return Ember.RSVP.all(linkedInstances).then((instances) => {

      instances.forEach((instance) => {
        let link = iLinks.findBy('targetInstanceId', instance.id);
        link.set('linkedInstanceName', instance.name);
      });

      return model;
    })
  },
});
