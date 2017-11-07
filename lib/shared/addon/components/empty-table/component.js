import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  projects: service(),

  classNames: ['row border-dash'],
  showNew: true,
  ctx: 'projectId',

  projectId: alias('projects.current.id'),
});
