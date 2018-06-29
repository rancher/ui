import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  model:      null,
  tagName:    'TR',
  classNames: ['main-row'],
});
