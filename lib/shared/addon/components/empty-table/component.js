import Ember from 'ember';

export default Ember.Component.extend({
  projects: Ember.inject.service(),

  classNames: ['row border-dash'],
  showNew: true,
  ctx: 'projectId',

  projectId: Ember.computed.alias('projects.current.id'),
});
