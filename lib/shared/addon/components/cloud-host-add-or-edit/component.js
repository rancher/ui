import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import Driver from 'shared/mixins/host-driver';
import layout from './template';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Component.extend(Driver, {
  layout,
  store: service('cluster-store'),
  errors:          null,
  host:            null,
  clonedModel:     null,
  primaryResource: alias('clonedModel'),
  hostOptions:     null,
  labelResource:   alias('primaryResource'),

  didReceiveAttrs() {
    this._super(...arguments);

    this.setProperties({
      hostOptions: this.get(`hostTemplate.publicValues.${this.get('hostTemplate.driver')}Config`),
      // @@TODO@@ - 11-28-17 - not sure we should be doing this this way how the heck do we know which host to clone labels from?
      // clonedModel: this.get('host').clone(),
      clonedModel: get(this, 'store').createRecord({type: 'host'}),
    });

  },

  actions: {
  },
});
