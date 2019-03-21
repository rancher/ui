import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  model:          null,
  fullColspan:    null,
  afterName:      0,
  afterState:     0,
  alignState:     'text-center',
  showActions:    true,
  noGroup:        'namespaceGroup.none',
  tagName:        '',
  otherNamespace: null,
});
