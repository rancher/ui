import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate: function() {
    this.send('setPageName','Settings');
    this._super();
  },
});
