import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.get('store').find('service', params.service_id);
  },

  actions: {
    didTransition: function() {
      this._super();
      this.get('controller').getEnvironment().then((env) => {
        console.log('setPageLayout');
        this.send('setPageLayout', {label: env.get('name'), backRoute: 'environment', hasAside: 'nav-services active'});
      });
    },
  }
});
