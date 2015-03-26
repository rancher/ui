import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    this.send('setPageLayout', {label: 'Containers'});
  },
});
