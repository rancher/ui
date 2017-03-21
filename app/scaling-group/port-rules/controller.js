import Ember from 'ember';

export default Ember.Controller.extend({
  rules: Ember.computed.alias('model.lbConfig.portRules'),
});
