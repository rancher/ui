import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params/*, transition*/) {
    var store = this.get('store');

    return Ember.Object.create({
      volume: store.createRecord({
        type: 'volume',
        driver: params.driverName,
        name: '',
        driverOpts: {},
      }),
    });
  },
});
