import Ember from 'ember';
import Driver from 'ui/mixins/driver';

export default Ember.Component.extend(Driver, {
  errors: null,
  host: null,
  clonedModel: null,
  primaryResource: Ember.computed.alias('clonedModel'),
  didReceiveAttrs() {
    this._super(...arguments);
    this.set('clonedModel', this.get('host').clone());
  },
  actions: {
    saveTemp() {
    },
  },
  hostOptions: Ember.computed.alias('hostTemplate.publicValues.amazonec2Config'),
});
