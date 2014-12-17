import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.get('store').find('host', params.host_id);
  },

  render: function() {
    this._super();
    this.send('setPageName','Hosts');
  },
});
