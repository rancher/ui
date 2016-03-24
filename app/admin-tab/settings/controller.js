import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  settings    : Ember.inject.service(),
  projectId   : Ember.computed.alias(`tab-session.${C.TABSESSION.PROJECT}`),
});
