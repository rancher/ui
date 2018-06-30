import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'

export default Component.extend({
  scope:   service(),
  session:  service(),

  layout,
  model:   null,
  tagName: '',
});
