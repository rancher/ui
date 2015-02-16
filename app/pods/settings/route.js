import Ember from 'ember';

export default Ember.Route.extend({
  render: function() {
    this._super.apply(this,arguments);
    this.send('setPageLayout', {label: 'Settings'});
  },
});
