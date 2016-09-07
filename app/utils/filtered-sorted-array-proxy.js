import Ember from 'ember';

export default Ember.ArrayProxy.extend({
  content: Ember.computed.alias('sourceContent'),
});
