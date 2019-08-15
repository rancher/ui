import Component from '@ember/component';
import layout from './template';
import { computed, get } from '@ember/object';

export default Component.extend({
  question:    null,
  answer:      null,
  namespaceId: '',

  layout,

  tagName:    'div',

  namespace: computed('namespaceId', function() {
    return { id: get(this, 'namespaceId'), }
  }),
});
