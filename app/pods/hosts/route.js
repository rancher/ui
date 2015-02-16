import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    newContainer: function() {
      this.transitionTo('newContainer');
    },
  },

  model: function() {
    console.log('hosts model');
    return this.get('store').findAll('host');
  },

  render: function() {
    this._super.apply(this,arguments);
    this.send('setPageLayout', {label: 'Hosts'});
  },
});
