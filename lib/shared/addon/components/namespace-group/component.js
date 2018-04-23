import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  model:        null,
  fullColspan:  null,
  alignState:   'text-center',
  noGroup:      'namespaceGroup.none',

  tagName:      '',
});
