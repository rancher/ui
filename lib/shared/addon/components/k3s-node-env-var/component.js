import Component from '@ember/component';
import layout from './template';

const HEADERS = [
  {
    name:           'key',
    sort:           ['key'],
    translationKey: 'annotationsSection.key',
  },
  {
    name:           'value',
    sort:           ['value', 'key'],
    translationKey: 'annotationsSection.value',
  },
];

export default Component.extend({
  layout,
  classNames: ['col', 'span-12'],

  node:    null,
  headers: HEADERS,

});
