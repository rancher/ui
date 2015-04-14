import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    didTransition: function() {
      this.send('setPageLayout', {
        label: this.get('controller.name'),
        addRoute: 'service.new',
        addParams: {
          queryParams: {
            environmentId: this.get('controller.id'),
          },
        },
        hasAside: 'nav-services active'
      });
    },
  },

  model: function(params) {
    var store = this.get('store');
    return store.find('environment', params.environment_id).then((env) => {
      return store.find('service', null, {
        filter: {
          environmentId: env.get('id'),
        },
        include: ['consumedservices','instances']
      }).then((services) => {
        env.set('services', services||[]);
        return env;
      });
    });
  },
});
