import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel: function() {
    return this.get('authStore').rawRequest({url: '/v1-auth/schemas', dataType: 'json'}).then((resp) => {
      return this.get('authStore')._bulkAdd('schema', resp.body.data);
    });
  },
});
