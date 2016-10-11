import Ember from 'ember';

export default Ember.Component.extend({
  settings: Ember.inject.service(),

  showUser: true,
  catalog: null,

  stackId: null,
  hasKubernetes: null,
  hasMesos: null,
  hasSwarm: null,
  hasInfra: null,

  didReceiveAttrs() {
    let k8s = this.get('catalog.catalog').findBy('id','infra:infra*k8s');
    let mesos = this.get('catalog.catalog').findBy('id','infra:infra*k8s');
    let swarm = this.get('catalog.catalog').findBy('id','infra:infra*k8s');
    let infra = this.get('catalog.catalog').findBy('templateBase','infra');
    this.setProperties({
      hasKubernetes: !!k8s,
      hasMesos: !!mesos,
      hasSwarm: !!swarm,
      hasInfra: !!infra,
    });
  },

  actions: {
    newService() {
      var stackId = this.get('stackId');

      if ( stackId )
      {
        this.get('router').transitionTo('service.new', {queryParams: {stackId: stackId}});
      }
      else
      {
        var stack = this.get('store').createRecord({
          type: 'stack',
          name: 'Default',
        });

        return stack.save().then(() => {
          this.get('router').transitionTo('service.new', {queryParams: {stackId: stack.get('id') }});
        });
      }
    },
  }
});
