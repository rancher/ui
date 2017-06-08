import Ember from 'ember';
import Driver from 'ui/mixins/driver';

export default Ember.Component.extend(Driver, {
  errors:          null,
  host:            null,
  clonedModel:     null,
  primaryResource: Ember.computed.alias('clonedModel'),
  hostOptions:     null,
  labelResource: Ember.computed.alias('primaryResource'),

  didReceiveAttrs() {
    this._super(...arguments);

    this.setProperties({
      hostOptions: this.get(`hostTemplate.publicValues.${this.get('hostTemplate.driver')}Config`),
      clonedModel: this.get('host').clone(),
    });

  },

  actions: {
    saveTemp() {
    },
  },
});
