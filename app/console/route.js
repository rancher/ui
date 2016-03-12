import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    let store = this.get('store');
    return store.find('container', params.instanceId).then((response) => {
      return response;
    });
  },
});
