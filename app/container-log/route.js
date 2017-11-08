import Route from '@ember/routing/route';

export default Route.extend({
  model: function(params) {
    let store = this.get('store');
    return store.find('container', params.instanceId).then((response) => {
      return response;
    });
  },
});
