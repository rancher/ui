import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object'

export default Component.extend({
  layout,
  tagName:    '',
  error:   computed('model.status.conditions.@each', function() {
    return this.model.status.conditions.find((condition) => condition.type === 'Failed')
  }),
  errorMessage: computed('error.message', function() {
    return this.error.message;
  })
});
