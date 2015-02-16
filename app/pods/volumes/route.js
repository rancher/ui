import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('volume');
  },

  render: function() {
    this._super.apply(this,arguments);
    this.send('setPageLayout', {label: 'Volumes'});
  },
});
