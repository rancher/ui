import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.get('store').findAll('host').then((all) => {
      return this.get('store').find('host', params.host_id).then((host) => {
        return Ember.Object.create({
          all: all,
          host: host,
        });
      });
    });
  },
});
