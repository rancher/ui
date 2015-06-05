import Ember from 'ember';
import ReadLabels from 'ui/mixins/read-labels';

export default Ember.Component.extend(ReadLabels,{
  model: null,
  labelResource: Ember.computed.alias('model'),
});
