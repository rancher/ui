import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  classNames: 'col span-3 mt-0 mb-0',

  label: null,
  logo:  null,
  url:   null,
});
