import Ember from 'ember';

export default Ember.Checkbox.extend({
  attributeBindings: ['nodeId'],
  nodeId: null,
});
