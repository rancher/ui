import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  question:    null,
  answer:      null,
  namespaceId: '',

  layout,

  tagName:    'div',

});
