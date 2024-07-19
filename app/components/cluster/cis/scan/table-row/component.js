import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object'

export default Component.extend({
  layout,
  tagName:      '',
  errorMessage: reads('error.message'),
  error:        computed('model.status.conditions.[]', function() {
    return this.model.status.conditions.find((condition) => condition.type === 'Failed')
  }),
});
