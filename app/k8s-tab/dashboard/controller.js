import Ember from 'ember';

export default Ember.Controller.extend({
  projects: Ember.inject.service(),

  actions: {
    openDashboard() {
      window.open(this.get('model.dashboardUrl'),'_blank');
    }
  }
});
