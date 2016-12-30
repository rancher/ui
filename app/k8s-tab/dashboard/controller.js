import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    openDashboard() {
      window.open(this.get('model.dashboardUrl'),'_blank');
    }
  }
});
