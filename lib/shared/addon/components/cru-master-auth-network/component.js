import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  editing: false,
  isNew:   true,
  config:  null,
});
