import Ember from 'ember';

export default Ember.Controller.extend({
  usefulPools: function() {
    return this.get('model.all').filter((pool) => {
      return !!pool.get('driverName');
    });
  }.property('model.all.@each.driverName'),
});
