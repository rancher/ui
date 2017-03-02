import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model() {
    return Ember.Object.create({
      dashboardUrl: this.get('app.swarmDashboard').replace(this.get('app.projectToken'), this.get(`tab-session.${C.TABSESSION.PROJECT}`)),
    });
  },
});
