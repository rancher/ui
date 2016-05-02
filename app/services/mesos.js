import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  'tab-session': Ember.inject.service('tab-session'),

  isReady: function() {
    var projectId = this.get(`tab-session.${C.TABSESSION.PROJECT}`);
    return this.get('store').request({
      url: `${this.get('app.mesosEndpoint').replace('%PROJECTID%', projectId)}/${C.MESOS.HEALTH}`
    }).then(() => {
      return true;
    }).catch(() => {
      return Ember.RSVP.resolve(false);
    });
  },
});
