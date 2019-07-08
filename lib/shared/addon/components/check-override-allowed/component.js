import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  questions:               null,
  paramName:               null,
  clusterTemplateRevision: null,
  applyClusterTemplate:    false,
});
