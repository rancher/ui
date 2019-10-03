import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  waitUntilResolved: null,

  // possible passed-in values with their defaults:
  content:            null,
  prompt:             null,
  optionValuePath:    'value',
  optionLabelPath:    'label',
  optionGroupPath:    'group',
  optionDisabledPath: 'disabled',

  value:              null,
  localizedPrompt:    false,
  localizedLabel:     false,
  localizedHtmlLabel: false,
  disabled:           false,

  ungroupedContent: null,
  groupedContent:   null,
});
