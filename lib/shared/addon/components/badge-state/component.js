import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  tagName:           'SPAN',
  classNames:        ['badge-state', 'vertical-middle'],
  classNameBindings: ['model.stateBackground', 'capitalizeText:text-capitalize'],

  capitalizeText: true,
});
