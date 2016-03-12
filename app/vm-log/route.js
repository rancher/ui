import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    let store = this.get('store');
    return store.find('virtualmachine', params.instanceId).then((response) => {
      return response;
    });
  },
});
