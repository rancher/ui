import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  layout,
  model:    null,
  tagName:  '',

  configKeys: computed('model.keys', 'model.binaryData', function() {
    const { model: config } = this;

    if (isEmpty(config.keys)) {
      if (isEmpty(config.binaryData)) {
        return [];
      } else {
        if (!isEmpty(Object.keys(config.binaryData))) {
          return Object.keys(config.binaryData);
        }
      }
    } else {
      return config.keys;
    }
  }),

});
