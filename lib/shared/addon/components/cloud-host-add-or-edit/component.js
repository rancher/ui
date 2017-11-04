import Component from '@ember/component';
import Driver from 'shared/mixins/host-driver';
import layout from './template';
import { computed } from '@ember/object';

export default Component.extend(Driver, {
  layout,
  errors:          null,
  host:            null,
  clonedModel:     null,
  primaryResource: computed.alias('clonedModel'),
  hostOptions:     null,
  labelResource:   computed.alias('primaryResource'),

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
