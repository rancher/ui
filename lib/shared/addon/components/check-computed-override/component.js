import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  tagName:               '',

  applyClusterTemplate:  null,
  clusterTemplateCreate: null,

  computedOverrideAllowed() {
    throw new Error('computedOverrideAllowed function required!');
  }
});
