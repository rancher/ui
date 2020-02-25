import Component from '@ember/component';
import layout from './template';
import { alias } from '@ember/object/computed';

export default Component.extend({
  layout,

  editing:   false,
  k3sConfig: alias('cluster.k3sConfig'),
});
