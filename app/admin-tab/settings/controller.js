import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  settings    : Ember.inject.service(),
  projectId   : Ember.computed.alias(`tab-session.${C.TABSESSION.PROJECT}`),
  queryParams : ['backToAdd'],
  backToAdd   : false,
  errors      : null,
  editing     : true,
  saving      : false,

  actions: {
    newHostSet: function() {
        if (this.get('backToAdd')) {

          this.transitionToRoute('hosts.new', this.get('projectId'));
        } else {

          this.send('goToPrevious');
        }
    }
  }
});
