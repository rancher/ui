import Component from '@ember/component';
import layout from './template';
import { sort } from '@ember/object/computed';

export default Component.extend({
  layout,
  arranged:         sort('model','sorting'),
  currentClusterId: null,
  sorting:          ['driver','name'],
});
