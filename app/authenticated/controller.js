import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  needs: ['application'],
  currentPath: Ember.computed.alias('controllers.application.currentPath'),
  error: null,
});
