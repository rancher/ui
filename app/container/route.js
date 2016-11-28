import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.get('store').find('container', params.container_id);
  },
});
