import Ember from 'ember';
import Driver from 'ui/mixins/driver';

export default Ember.Component.extend(Driver, {
  errors: null,
  host: null,
  clonedModel: null,
  primaryResource: Ember.computed.alias('clonedModel'),
  didReceiveAttrs() {
    this._super(...arguments);
    // debugger;
    this.set('clonedModel', this.get('host').clone());
  },
  actions: {
    saveTemp() {
    },
  },
});
