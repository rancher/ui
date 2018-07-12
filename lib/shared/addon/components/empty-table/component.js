import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  app:        service(),
  scope:      service(),
  layout,
  classNames: ['row border-dash'],
  showNew:    true,
  disabled:   false,

  ctx: 'projectId', // or clusterId
});
